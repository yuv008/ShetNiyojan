from flask import Flask, request, jsonify 
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from db import users_collection
import base64
from groq import Groq
from decouple import config
from io import BytesIO
from functools import wraps


app = Flask(__name__)


# Middleware for token-based authentication
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



@app.route('/api/users/register', methods=['POST'])
def register():
    data = request.json
    fullname = data.get('fullname')
    mobileno = data.get('mobileno')
    password = data.get('password')

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


@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    mobileno = data.get('mobileno')
    password = data.get('password')

    user = users_collection.find_one({'mobileno': mobileno})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = str(uuid.uuid4())
    users_collection.update_one({'mobileno': mobileno}, {'$set': {'token': token}})

    return jsonify({'token': token})


@app.route('/api/users/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        'fullname': current_user['fullname'],
        'mobileno': current_user['mobileno']
    })


# groq vision
@app.route('/api/plant-disease-analysis', methods=['POST'])
@token_required
def analyze_plant():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Read and encode image
        image_file = request.files['image']
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        # Prompt for Groq Vision model
        prompt = """
        You are an expert plant disease diagnosis agent. Analyze the uploaded plant image and respond with a detailed JSON object including:
        {
            "diseaseName": "...",
            "confidence": "...",
            "severity": "...",
            "description": "...",
            "causes": "...",
            "symptoms": "...",
            "recommendations": "..."
        }
        Be precise and scientific in your response dont include any unnecessay text and responses. The output should be strictly valid JSON and nothing else.
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
    

if __name__ == '__main__':
    app.run(debug=True)
