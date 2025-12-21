from django.db import models
from apps.users.models import User


class GalleryAlbum(models.Model):
    """Photo albums for organizing gallery images"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='gallery/albums/', blank=True, null=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='albums')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-is_featured', 'order', '-created_at']
        db_table = 'gallery_album'
    
    def __str__(self):
        return self.title
    
    @property
    def image_count(self):
        return self.images.count()


class GalleryImage(models.Model):
    """Individual gallery images"""
    album = models.ForeignKey(GalleryAlbum, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='gallery/%Y/%m/')
    thumbnail = models.ImageField(upload_to='gallery/thumbnails/%Y/%m/', blank=True, null=True)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gallery_images')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    # Optional metadata
    photographer = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    event_date = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['-is_featured', 'order', '-uploaded_at']
        db_table = 'gallery_image'
    
    def __str__(self):
        return self.title