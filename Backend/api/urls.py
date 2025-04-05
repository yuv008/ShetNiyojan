from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, UserViewSet, RegisterView, LoginView, PlantDiseaseAnalysisView

# Create a router
router = DefaultRouter()

# Register ViewSets with explicit `basename`
router.register(r'tasks', TaskViewSet, basename='task')  
router.register(r'users', UserViewSet, basename='user')  

urlpatterns = [
    path('', include(router.urls)),  # Includes all ViewSets (tasks, users)
    
    # Registration and Login should be mapped separately
    path('userview/register/', RegisterView.as_view(), name='user-register'),
    path('userview/login/', LoginView.as_view(), name='user-login'),
    path('plant-disease-analysis/',PlantDiseaseAnalysisView.as_view(),name='plant-disease-analysis'),
    # Optional: Authentication URLs (for login/logout)
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
]
