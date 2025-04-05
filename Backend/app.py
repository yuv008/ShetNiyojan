from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from db import users_collection, yields_collection
import base64
from groq import Groq
from decouple import config
import pandas as pd
import numpy as np
from functools import wraps
import pickle as pkl
from flask_cors import CORS
import os
import datetime
from bson.objectid import ObjectId

base_dir  = os.path.dirname(os.path.abspath(__file__))

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
@token_required
def analyze_plant(current_user):
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Read and encode image
        image_file = request.files['image']
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        # Prompt for Groq Vision model
        prompt = """
        You are an expert plant disease diagnosis agent. Analyze the uploaded plant image and respond with a detailed and informative JSON object including:
        {
            "diseaseName": "...",
            "confidence": "...",
            "severity": "...",
            "description": "...",
            "causes": "...",
            "symptoms": "...",
            "recommendations": "..."
        }
        Be precise and scientific in your response. The output should be strictly valid JSON and nothing else.
        """

        # Groq client setup
        GROQ_API_KEY = config("GROQ_API_KEY")
        client = Groq(api_key=GROQ_API_KEY)

        # Call Groq Vision
        response = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            temperature=0.5,
            max_completion_tokens=1024,
            top_p=1,
            stream=False
        )

        result = response.choices[0].message.content
        return jsonify({"analysis": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# ------------------ Crop Recommendation ------------------
@app.route('/api/crop-recommendation', methods=['POST'])
@token_required
def crop_recommendation(current_user):
    REQUIRED_FIELDS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

    # Validate input JSON
    data = request.get_json()
    missing_fields = [field for field in REQUIRED_FIELDS if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    try:
        # Load models (open the file first, then pass to pickle.load)
        model_path = os.path.join(os.getcwd(), 'models', 'crop_recommendation', 'crop_recommendation_model.pkl')
        scaler_path = os.path.join(os.getcwd(), 'models', 'crop_recommendation', 'minmaxscaler_crop_recommendation.pkl')

        with open(model_path, 'rb') as f:
            crop_recommend_model = pkl.load(f)

        with open(scaler_path, 'rb') as f:
            crop_scaler = pkl.load(f)

        # Prepare and scale input data
        df = pd.DataFrame([data])
        scaled_data = crop_scaler.transform(df)

        # Predict
        prediction = crop_recommend_model.predict(scaled_data)[0]
        return jsonify({'recommended_crop': prediction}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
            "createdAt": datetime.datetime.now()
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
        update_data['updatedAt'] = datetime.datetime.now()
        
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

# ------------------ Run App ------------------
if __name__ == '__main__':
    app.run(debug=True)
