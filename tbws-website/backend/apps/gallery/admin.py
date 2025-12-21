from django.contrib import admin
from django.utils.html import format_html
from .models import GalleryAlbum, GalleryImage


class GalleryImageInline(admin.TabularInline):
    model = GalleryImage
    extra = 1
    fields = ['title', 'image', 'order', 'is_featured']
    readonly_fields = ['uploaded_at']


@admin.register(GalleryAlbum)
class GalleryAlbumAdmin(admin.ModelAdmin):
    list_display = ['title', 'image_count', 'cover_preview', 'is_featured', 'order', 'created_at']
    list_filter = ['is_featured', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['is_featured', 'order']
    inlines = [GalleryImageInline]
    
    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" width="80" height="60" style="object-fit: cover;" />', obj.cover_image.url)
        return '-'
    cover_preview.short_description = 'Cover'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'album', 'image_preview', 'photographer', 'is_featured', 'order', 'uploaded_at']
    list_filter = ['is_featured', 'album', 'uploaded_at']
    search_fields = ['title', 'description', 'photographer', 'location']
    list_editable = ['is_featured', 'order']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('album', 'title', 'description', 'image', 'thumbnail')
        }),
        ('Metadata', {
            'fields': ('photographer', 'location', 'event_date'),
            'classes': ('collapse',)
        }),
        ('Display', {
            'fields': ('is_featured', 'order')
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="80" height="60" style="object-fit: cover;" />', obj.image.url)
        return '-'
    image_preview.short_description = 'Preview'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)