from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PlayerViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'players', PlayerViewSet, basename='player')

app_name = 'users'

urlpatterns = [
    path('', include(router.urls)),
]