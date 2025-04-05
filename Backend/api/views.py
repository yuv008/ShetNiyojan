from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import  UserSerializer , TaskSerializer
from .db import users_collection, tasks_collection
from bson.objectid import ObjectId
import bcrypt
from rest_framework.parsers import MultiPartParser, FormParser
import base64
from django.core.files.storage import default_storage
import requests
import os
from groq import Groq
import jwt
import datetime
from django.conf import settings


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(plain_password: str, hashed_password: str) -> bool:
    """Check password using bcrypt."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user_id, mobileno):
    """Generate JWT token."""
    payload = {
        'user_id': str(user_id),
        'mobileno': mobileno,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)  # Token expires in 1 day
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

# 🔹 User Registration API
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            print(user_data)
            # Check if user already exists
            if users_collection.find_one({"mobileno": user_data["mobileno"]}):
                return Response({"error": "Mobile no. already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Hash and save user
            user_data["password"] = bcrypt.hashpw(user_data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            result = users_collection.insert_one(user_data)
            
            # Generate token
            token = generate_token(result.inserted_id, user_data["mobileno"])
            
            return Response({
                "message": "User registered successfully",
                "token": token,
                "user": {
                    "fullname": user_data["fullname"],
                    "mobileno": user_data["mobileno"],
                    "_id": str(result.inserted_id)
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🔹 User Login API
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        mobileno = request.data.get("mobileno")
        password = request.data.get("password")

        user = users_collection.find_one({"mobileno":  mobileno})
        if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate token
        token = generate_token(user["_id"], mobileno)
        
        return Response({
            "message": "Login successful",
            "token": token,
            "user": {
                "fullname": user["fullname"],
                "mobileno": user["mobileno"],
                "_id": str(user["_id"])
            }
        }, status=status.HTTP_200_OK)

# user viewset
class UserViewSet(viewsets.ViewSet):
    """API endpoint to manage users in MongoDB."""
    
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get all users (excluding passwords)."""
        users = list(users_collection.find({}, {"password": 0}))  # Hide password
        # Convert ObjectId to string for JSON serialization
        for user in users:
            user["_id"] = str(user["_id"])
        return Response(users)

    def retrieve(self, request, pk=None):
        """Get a single user by ID."""
        user = users_collection.find_one({"_id": ObjectId(pk)}, {"password": 0})
        if not user:
            return Response({"error": "User not found"}, status=404)
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        return Response(user)

   

    def destroy(self, request, pk=None):
        """Delete a user."""
        result = users_collection.delete_one({"_id": ObjectId(pk)})
        if result.deleted_count == 0:
            return Response({"error": "User not found"}, status=404)
        return Response({"message": "User deleted"})




class TaskViewSet(viewsets.ViewSet):
    """API endpoint to manage tasks in MongoDB."""

    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get all tasks for the authenticated user."""
        tasks = list(tasks_collection.find({"created_by": request.user.mobileno}))
        return Response(tasks)

    def retrieve(self, request, pk=None):
        """Get a single task by ID."""
        task = tasks_collection.find_one({"_id": ObjectId(pk)})
        if not task:
            return Response({"error": "Task not found"}, status=404)
        return Response(task)

    def create(self, request):
        """Create a new task."""
        data = request.data
        data["created_by"] = request.user.mobileno  # Store the username
        result = tasks_collection.insert_one(data)
        return Response({"message": "Task created", "id": str(result.inserted_id)}, status=201)

    def destroy(self, request, pk=None):
        """Delete a task."""
        result = tasks_collection.delete_one({"_id": ObjectId(pk)})
        if result.deleted_count == 0:
            return Response({"error": "Task not found"}, status=404)
        return Response({"message": "Task deleted"})



