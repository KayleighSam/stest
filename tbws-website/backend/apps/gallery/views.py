from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import GalleryAlbum, GalleryImage
from .serializers import (
    GalleryAlbumSerializer,
    GalleryAlbumListSerializer,
    GalleryImageSerializer
)


class GalleryAlbumViewSet(viewsets.ModelViewSet):
    """
    ViewSet for gallery albums
    Full CRUD operations
    """
    queryset = GalleryAlbum.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'order']
    ordering = ['-is_featured', 'order', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return GalleryAlbumSerializer
        return GalleryAlbumListSerializer
    
    def get_permissions(self):
        """Allow anyone to view, but only authenticated users can create/edit/delete"""
        if self.action in ['list', 'retrieve', 'featured']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set the created_by field to the current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured albums"""
        featured_albums = self.get_queryset().filter(is_featured=True)[:6]
        serializer = self.get_serializer(featured_albums, many=True)
        return Response(serializer.data)


class GalleryImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for gallery images
    Full CRUD operations
    """
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['album', 'is_featured']
    search_fields = ['title', 'description', 'photographer', 'location']
    ordering_fields = ['uploaded_at', 'order', 'event_date']
    ordering = ['-is_featured', 'order', '-uploaded_at']
    
    def get_permissions(self):
        """Allow anyone to view, but only authenticated users can create/edit/delete"""
        if self.action in ['list', 'retrieve', 'featured', 'recent']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set the uploaded_by field to the current user"""
        serializer.save(uploaded_by=self.request.user)
    
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