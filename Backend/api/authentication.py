import jwt
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .db import users_collection
from bson.objectid import ObjectId

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # Get the token from the request headers
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None
            
        try:
            # Check if authorization header has the correct format
            if not auth_header.startswith('Bearer '):
                raise AuthenticationFailed('Invalid token format')
                
            # Extract token from header
            token = auth_header.split(' ')[1]
            
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Get user from database
            user_id = payload.get('user_id')
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            
            if not user:
                raise AuthenticationFailed('User not found')
            
            # Create a simple user object with necessary attributes
            auth_user = type('SimpleUser', (object,), {
                'id': str(user['_id']),
                'mobileno': user['mobileno'],
                'fullname': user['fullname'],
                'is_authenticated': True
            })
            
            return (auth_user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
            
    def authenticate_header(self, request):
        return 'Bearer' 