from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from db import users_collection
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# Middleware for token-based authentication
def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        user = users_collection.find_one({'token': token})
        if not user:
            return jsonify({'message': 'Invalid or expired token'}), 401

        return f(user, *args, **kwargs)
    decorated.__name__ = f.__name__
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


if __name__ == '__main__':
    app.run(debug=True)
