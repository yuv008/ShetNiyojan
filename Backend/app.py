from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from db import users_collection
import base64
from groq import Groq
from decouple import config
import pandas as pd
import numpy as np
from functools import wraps
import pickle as pkl
from flask_cors import CORS
import os

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
    

@app.route('/api/crop-recommendation', methods=['POST'])
# @token_required
def crop_recommendation():
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

# ------------------ Run App ------------------
if __name__ == '__main__':
    app.run(debug=True)
