from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend

from .models import GalleryAlbum, GalleryImage
from .serializers import (
    GalleryAlbumSerializer,
    GalleryAlbumListSerializer,
    GalleryImageSerializer
)


class GalleryAlbumViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for gallery albums
    """
    queryset = GalleryAlbum.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'order']
    ordering = ['-is_featured', 'order', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return GalleryAlbumSerializer
        return GalleryAlbumListSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured albums"""
        featured_albums = self.get_queryset().filter(is_featured=True)[:6]
        serializer = self.get_serializer(featured_albums, many=True)
        return Response(serializer.data)


class GalleryImageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for gallery images
    """
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['album', 'is_featured']
    search_fields = ['title', 'description', 'photographer', 'location']
    ordering_fields = ['uploaded_at', 'order', 'event_date']
    ordering = ['-is_featured', 'order', '-uploaded_at']
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured images"""
        featured_images = self.get_queryset().filter(is_featured=True)[:12]
        serializer = self.get_serializer(featured_images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent images"""
        recent_images = self.get_queryset()[:20]
        serializer = self.get_serializer(recent_images, many=True)
        return Response(serializer.data)