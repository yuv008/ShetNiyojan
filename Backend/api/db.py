from pymongo import MongoClient
from django.conf import settings

# MongoDB Atlas connection URI
MONGO_URI = "mongodb+srv://root:root@cluster0.kt3irzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Connect to MongoDB
client = MongoClient(MONGO_URI)

# Choose database
db = client["shetniyojan"]

# Choose collections
tasks_collection = db["tasks"]
users_collection = db["users"]
