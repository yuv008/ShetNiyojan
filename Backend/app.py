from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import json
from db import users_collection, yields_collection,activities_collection
from groq import Groq
from decouple import config
import pandas as pd
import numpy as np
from datetime import datetime
from bson import ObjectId
from functools import wraps
import pickle as pkl
from plant_disease_model import predict_disease
from flask_cors import CORS
import os
from bson.objectid import ObjectId

base_dir  = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = "uploads"

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ------------------ Token Middleware ------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        user = users_collection.find_one({"token": token})
        if not user or not token.strip():
            return jsonify({'error': 'Invalid or expired token'}), 401

        return f(user, *args, **kwargs)
    return decorated

# ------------------ User Registration ------------------
@app.route('/api/users/register', methods=['POST'])
def register():
    data = request.json
    fullname = data.get('fullname')
    mobileno = data.get('mobileno')
    password = data.get('password')

    if not fullname or not mobileno or not password:
        return jsonify({'message': 'All fields are required'}), 400

    if users_collection.find_one({'mobileno': mobileno}):
        return jsonify({'message': 'User already exists'}), 400

    hashed_pw = generate_password_hash(password)
    users_collection.insert_one({
        'fullname': fullname,
        'mobileno': mobileno,
        'password': hashed_pw,
        'token': None
    })

    return jsonify({'message': 'Registration successful'}), 201

# ------------------ User Login ------------------
@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    mobileno = data.get('mobileno')
    password = data.get('password')

    if not mobileno or not password:
        return jsonify({'message': 'Mobile number and password are required'}), 400

    user = users_collection.find_one({'mobileno': mobileno})
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401

    stored_password = user.get('password', '')
    if not stored_password or not check_password_hash(stored_password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = str(uuid.uuid4())
    users_collection.update_one({'mobileno': mobileno}, {'$set': {'token': token}})

    return jsonify({'token': token}), 200

# ------------------ User Profile ------------------
@app.route('/api/users/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        'fullname': current_user['fullname'],
        'mobileno': current_user['mobileno']
    })

# ------------------ Plant Disease Analyzer ------------------
@app.route('/api/plant-disease-analysis', methods=['POST'])
def plant_disease_analysis():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)

    try:
        result = predict_disease(image_path)
    
        predicted_label = result['class']
        confidence = round(result['confidence']*100,2)


        prompt = f"""
        The plant disease predicted is: **{predicted_label}**.

        As a plant pathology expert, generate a structured, informative JSON object with the following keys:
        {{
            "diseaseName": "Name of the disease",
            "description": "Scientific and general overview of the disease",
            "causes": "Possible causes or conditions for this disease",
            "symptoms": "Visual and physical symptoms to look out for",
            "recommendations": "Best practices to handle this disease",
            "doses": "Pesticide/fertilizer doses and frequency if applicable"
        }}

        Please be precise and strictly return only the valid JSON, no extra explanation.
        """

        # Initialize Groq client with API key
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        # Make the chat completion request
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant with deep agricultural and plant pathology knowledge."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.5,
            max_completion_tokens=1024,
            top_p=1,
            stop=None,
            stream=False
        )

# Extract the response
        detailed_info = chat_completion.choices[0].message.content.strip()


        return jsonify({
            "predictedDisease": predicted_label,
            "confidence": confidence,
            "analysis": detailed_info
        }), 200

    

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------ Yield Management ------------------
@app.route('/api/yields', methods=['GET'])
@token_required
def get_yields(current_user):
    try:
        user_yields = list(yields_collection.find({"userId": current_user["_id"]}))
        
        # Convert ObjectId to string for JSON serialization
        for yield_item in user_yields:
            yield_item['id'] = str(yield_item.pop('_id'))
            if 'userId' in yield_item:
                yield_item['userId'] = str(yield_item['userId'])
            
        return jsonify(user_yields), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/yields/<yield_id>', methods=['GET'])
@token_required
def get_yield(current_user, yield_id):
    try:
        # First, validate that the yield exists and belongs to the user
        yield_item = yields_collection.find_one({"_id": ObjectId(yield_id), "userId": current_user["_id"]})
        
        if not yield_item:
            return jsonify({"error": "Yield not found or access denied"}), 404
            
        # Convert ObjectId to string for JSON serialization
        yield_item['id'] = str(yield_item.pop('_id'))
        if 'userId' in yield_item:
            yield_item['userId'] = str(yield_item['userId'])
            
        return jsonify(yield_item), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/yields', methods=['POST'])
def create_yield():
    try:
        data = request.json
        print("Received yield creation request:", data)
        
        # Validate required fields
        if not data.get('name') or not data.get('acres') or not data.get('mobileno'):
            print("Missing required fields")
            return jsonify({"error": "Name, acres, and mobile number are required"}), 400
            
        # Find user by mobile number
        user = users_collection.find_one({'mobileno': data.get('mobileno')})
        if not user:
            print(f"User not found for mobile number: {data.get('mobileno')}")
            return jsonify({"error": "User not found with the provided mobile number"}), 404
            
        print(f"Found user with ID: {user['_id']}")
            
        # Create yield document with minimal required fields
        new_yield = {
            "name": data.get('name'),
            "acres": float(data.get('acres')),
            "status": "planning",
            "userId": user["_id"],
            "createdAt": datetime.now()
        }
        
        # Insert into database
        result = yields_collection.insert_one(new_yield)
        print(f"Inserted yield with ID: {result.inserted_id}")
        
        # Return the created yield with ID
        created_yield = new_yield.copy()
        created_yield['id'] = str(result.inserted_id)
        created_yield['userId'] = str(created_yield['userId'])  # Convert userId to string for JSON serialization
        if '_id' in created_yield:
            del created_yield['_id']
        
        return jsonify(created_yield), 201
    except Exception as e:
        print(f"Error creating yield: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/yields/<yield_id>', methods=['PUT'])
@token_required
def update_yield(current_user, yield_id):
    try:
        data = request.json
        
        # Check if yield exists and belongs to user
        existing_yield = yields_collection.find_one({"_id": ObjectId(yield_id), "userId": current_user["_id"]})
        if not existing_yield:
            return jsonify({"error": "Yield not found or access denied"}), 404
            
        # Update fields
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'acres' in data:
            update_data['acres'] = float(data['acres'])
        if 'status' in data:
            update_data['status'] = data['status']
        if 'health' in data:
            update_data['health'] = data['health']
        if 'plantDate' in data:
            update_data['plantDate'] = data['plantDate']
            
        # Add updatedAt timestamp
        update_data['updatedAt'] = datetime.now()
        
        # Update in database
        yields_collection.update_one(
            {"_id": ObjectId(yield_id)},
            {"$set": update_data}
        )
        
        # Return updated yield
        updated_yield = yields_collection.find_one({"_id": ObjectId(yield_id)})
        updated_yield['id'] = str(updated_yield.pop('_id'))
        if 'userId' in updated_yield:
            updated_yield['userId'] = str(updated_yield['userId'])
        
        return jsonify(updated_yield), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/yields/<yield_id>', methods=['DELETE'])
@token_required
def delete_yield(current_user, yield_id):
    try:
        # Check if yield exists and belongs to user
        existing_yield = yields_collection.find_one({"_id": ObjectId(yield_id), "userId": current_user["_id"]})
        if not existing_yield:
            return jsonify({"error": "Yield not found or access denied"}), 404
            
        # Delete from database
        yields_collection.delete_one({"_id": ObjectId(yield_id)})
        
        return jsonify({"message": "Yield deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#activities



@app.route('/api/create_activity', methods=['POST'])
def create_activity():
    data = request.get_json()

    if not data or 'activity_type' not in data:
        return jsonify({"error": "Missing 'activity_type'"}), 400

    activity_type = data['activity_type']

    # Required fields per activity type
    if activity_type == 'fertilizer':
        required_fields = ['yield_id', 'mobileno', 'activity_name', 'summary', 'amount', 'fertilizer_name', 'quantity', 'bill_image']
    elif activity_type == 'pesticide':
        required_fields = ['yield_id', 'mobileno', 'activity_name', 'summary', 'amount', 'pesticide_name', 'quantity', 'bill_image']
    elif activity_type == 'financial':
        required_fields = ['yield_id', 'mobileno', 'activity_name', 'summary', 'amount', 'financial_category', 'payment_method', 'receipt']
    else:
        required_fields = ['yield_id', 'mobileno', 'activity_name', 'summary', 'amount']

    # Check for missing fields
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Get user by mobile number
    user = users_collection.find_one({'mobileno': data['mobileno']})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Validate yield ID and ownership
    try:
        yield_obj = yields_collection.find_one({
            '_id': ObjectId(data['yield_id']),
            'userId': user['_id']
        })
    except Exception as e:
        return jsonify({"error": f"Invalid yield ID format: {str(e)}"}), 400

    if not yield_obj:
        return jsonify({"error": "Yield not found for this user"}), 404

    # Base activity data
    activity = {
        'userId': user['_id'],
        'yieldId': yield_obj['_id'],
        'activity_type': data['activity_type'],
        'activity_name': data['activity_name'],
        'summary': data['summary'],
        'amount': data['amount'],
        'created_at': datetime.utcnow()
    }

    # Add extra fields
    if activity_type == 'fertilizer':
        activity['fertilizer_name'] = data['fertilizer_name']
        activity['quantity'] = data['quantity']
        activity['bill_image'] = data['bill_image']

    elif activity_type == 'pesticide':
        activity['pesticide_name'] = data['pesticide_name']
        activity['quantity'] = data['quantity']
        activity['bill_image'] = data['bill_image']

    elif activity_type == 'financial':
        activity['financial_category'] = data['financial_category']
        activity['payment_method'] = data['payment_method']
        activity['receipt'] = data['receipt']

    # Insert into activities_collection
    activities_collection.insert_one(activity)

    return jsonify({"message": f"{activity_type.capitalize()} activity created successfully."}), 201

@app.route('/api/activities',methods=['POST'])
def get_activities():
    data = request.get_json()
    mobileno = data.get('mobileno')
    yield_id = data.get('yield_id')
    print(mobileno +" "+yield_id)

    if not mobileno or not yield_id:
        return jsonify({"error": "Missing 'mobileno' or 'yield_id' in query parameters"}), 400

    # Find user by mobileno
    user = users_collection.find_one({'mobileno': mobileno})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Find yield with given yield_id and user ownership
    try:
        yield_obj = yields_collection.find_one({
            '_id': ObjectId(yield_id),
            'userId': user['_id']
        })
    except Exception as e:
        return jsonify({"error": f"Invalid yield ID format: {str(e)}"}), 400

    if not yield_obj:
        return jsonify({"error": "Yield not found for this user"}), 404
    print(yield_obj)
    # Fetch activities matching both user and yield
    activities = list(activities_collection.find({
        'userId': user['_id'],
        'yieldId': yield_obj['_id']
    }))
    # print(activities)

    # Convert ObjectId to string for JSON serializability
    for activity in activities:
        activity['_id'] = str(activity['_id'])
        activity['userId'] = str(activity['userId'])
        activity['yieldId'] = str(activity['yieldId'])
        activity['created_at'] = activity['created_at'].isoformat()

    return jsonify({"activities": activities}), 200

import joblib
#  Get Groq API key from environment variables
GROQ_API_KEY = config('GROQ_API_KEY')

# Load the model
try:
    model = joblib.load("./models/adaboost_model_soil.pkl")
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Function to get insights from Groq
def get_groq_insights(soil_params, soil_type, location, land_area, model_name="llama3-70b-8192"):
    # Create a prompt for Groq
    prompt = f"""
    As an agricultural expert, provide detailed insights and recommendations based on the following soil analysis:
    
    Location: {location}
    Land Area: {land_area} hectares
    Soil Type: {soil_type}
    
    Soil Parameters:
    - Nitrogen: {soil_params['N']} kg/ha
    - Phosphorus: {soil_params['P']} kg/ha
    - Potassium: {soil_params['K']} kg/ha
    - Temperature: {soil_params['temperature']}°C
    - Humidity: {soil_params['humidity']}%
    - pH: {soil_params['ph']}
    - Rainfall: {soil_params['rainfall']} mm/month
    
    Please provide:
    1. Top 3 most suitable crops with brief explanations
    2. Estimated yield potential for each recommended crop
    3. Specific farming recommendations (planting time, irrigation needs, fertilizer suggestions)
    4. Any soil health concerns and improvement strategies
    5. Sustainable farming practices that would work well with this soil profile
    
    Format your response as JSON with the following structure:
    {{
        "top_crops": [
            {{"name": "Crop1", "suitability": "95%", "water_requirement": "High/Medium/Low", "growth_period": "X-Y months"}},
            {{"name": "Crop2", "suitability": "87%", "water_requirement": "High/Medium/Low", "growth_period": "X-Y months"}},
            {{"name": "Crop3", "suitability": "79%", "water_requirement": "High/Medium/Low", "growth_period": "X-Y months"}}
        ],
        "best_crop": {{
            "name": "Crop1",
            "confidence": "95%",
            "environmental_suitability": "Excellent/Good/Moderate",
            "estimated_yield": "X-Y tons/hectare",
            "recommendation": "Brief planting and care recommendation"
        }},
        "soil_health": {{
            "status": "Excellent/Good/Needs improvement",
            "concerns": ["Concern1", "Concern2"],
            "improvement_strategies": ["Strategy1", "Strategy2", "Strategy3"]
        }},
        "sustainable_practices": ["Practice1", "Practice2", "Practice3"]
    }}
    """
    
    try:
        # Prepare the API request for Groq
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": "You are an expert agricultural advisor with deep knowledge of soil science, crop selection, and sustainable farming practices."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        
        # Call Groq API
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        # Parse the response
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        insights = json.loads(content)
        return insights, None
    
    except Exception as e:
        error_message = f"Error getting insights: {str(e)}"
        return None, error_message

# Routes


@app.route('/crop-recommendation', methods=['POST'])
def crop_recommendation():
    if not model:
        return jsonify({"error": "Model not loaded. Please check server logs."}), 500
    
    try:
        # Get data from request
        data = request.get_json()
        
        # Extract parameters
        location = data.get('location', 'Unknown')
        soil_type = data.get('soil_type', 'Unknown')
        land_area = float(data.get('land_area', 1.0))
        
        # Soil parameters
        soil_params = {
            'N': float(data.get('nitrogen', 0)),
            'P': float(data.get('phosphorus', 0)),
            'K': float(data.get('potassium', 0)),
            'temperature': float(data.get('temperature', 25)),
            'humidity': float(data.get('humidity', 60)),
            'ph': float(data.get('ph', 7.0)),
            'rainfall': float(data.get('rainfall', 100))
        }
        
        # Create features array for prediction
        features = np.array([[
            soil_params['N'], 
            soil_params['P'], 
            soil_params['K'],
            soil_params['temperature'],
            soil_params['humidity'],
            soil_params['ph'],
            soil_params['rainfall']
        ]])
        
        # Make prediction with model
        predicted_soil = model.predict(features)[0]
        probabilities = model.predict_proba(features)
        highest_prob = float(np.max(probabilities) * 100)
        
        # Get AI insights if Groq API key is available
        model_name = data.get('model_name', 'llama3-70b-8192')
        if GROQ_API_KEY:
            insights, error = get_groq_insights(soil_params, soil_type, location, land_area, model_name)
            if error:
                return jsonify({
                    "predicted_soil": predicted_soil,
                    "confidence": highest_prob,
                    "error": error
                })
        else:
            insights = None
        
        # Prepare response
        response = {
            "predicted_soil": predicted_soil,
            "confidence": highest_prob,
            "insights": insights
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/models', methods=['GET'])
def get_models():
    models = [
        {
            "id": "llama3-70b-8192",
            "name": "Llama 3 70B",
            "description": "Highest quality results, best for detailed agricultural insights"
        },
        {
            "id": "llama3-8b-8192",
            "name": "Llama 3 8B",
            "description": "Good balance of quality and speed"
        },
        {
            "id": "gemma-7b-it",
            "name": "Gemma 7B",
            "description": "Fast response times, good for basic recommendations"
        },
        {
            "id": "mixtral-8x7b-32768",
            "name": "Mixtral 8x7B",
            "description": "Powerful model with strong reasoning capabilities"
        }
    ]
    return jsonify(models)

# ------------------ Run App ------------------
if __name__ == '__main__':
    app.run(debug=True)
