from rest_framework import serializers
from .models import GalleryAlbum, GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'album',
            'title',
            'description',
            'image',
            'thumbnail',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_at',
            'is_featured',
            'order',
            'photographer',
            'location',
            'event_date'
        ]
        read_only_fields = ['uploaded_by', 'uploaded_at']


class GalleryAlbumSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    image_count = serializers.ReadOnlyField()
    images = GalleryImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = GalleryAlbum
        fields = [
            'id',
            'title',
            'description',
            'cover_image',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
            'is_featured',
            'order',
            'image_count',
            'images'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'image_count']


class GalleryAlbumListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for album list (without images)"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    image_count = serializers.ReadOnlyField()
    
    class Meta:
        model = GalleryAlbum
        fields = [
            'id',
            'title',
            'description',
            'cover_image',
            'created_by_name',
            'created_at',
            'is_featured',
            'image_count'
        ]