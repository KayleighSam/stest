from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GalleryAlbumViewSet, GalleryImageViewSet

app_name = 'gallery'

router = DefaultRouter()
router.register(r'albums', GalleryAlbumViewSet, basename='album')
router.register(r'images', GalleryImageViewSet, basename='image')

urlpatterns = [
    path('', include(router.urls)),
]