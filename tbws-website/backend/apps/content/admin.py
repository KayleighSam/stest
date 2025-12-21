from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Category, Tag, Post, Comment, ContactMessage, Newsletter


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'post_count', 'color_badge', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_per_page = 20
    
    def color_badge(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px 10px; border-radius: 3px; color: white;">{}</span>',
            obj.color,
            obj.name
        )
    color_badge.short_description = 'Color'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    fields = ['author', 'guest_name', 'content', 'is_approved', 'created_at']
    readonly_fields = ['created_at']
    can_delete = True


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
        'title', 
        'post_type', 
        'category', 
        'status_badge', 
        'author', 
        'published_at', 
        'views',
        'is_featured',
        'is_pinned'
    ]
    list_filter = [
        'status', 
        'post_type', 
        'category', 
        'is_featured',
        'is_pinned',
        'created_at',
        'published_at'
    ]
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'published_at'
    filter_horizontal = ['tags']
    list_editable = ['is_featured', 'is_pinned']
    inlines = [CommentInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 
                'slug', 
                'post_type', 
                'category', 
                'tags',
                'author'
            )
        }),
        ('Content', {
            'fields': (
                'excerpt', 
                'content', 
                'featured_image',
                'image_caption'
            )
        }),
        ('Event Details', {
            'fields': (
                'event_date', 
                'event_end_date',
                'event_location',
                'event_venue',
                'event_registration_link'
            ),
            'classes': ('collapse',),
            'description': 'Only for Event post type'
        }),
        ('Publishing', {
            'fields': (
                'status', 
                'published_at',
                'is_featured',
                'is_pinned',
                'allow_comments'
            )
        }),
        ('SEO & Analytics', {
            'fields': (
                'meta_description', 
                'meta_keywords',
                'views'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['views']
    
    def status_badge(self, obj):
        colors = {
            'draft': 'gray',
            'published': 'green',
            'archived': 'orange'
        }
        return format_html(
            '<span style="background-color: {}; padding: 5px 10px; border-radius: 3px; color: white;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new post
            obj.author = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['publish_posts', 'archive_posts', 'feature_posts', 'unfeature_posts']
    
    def publish_posts(self, request, queryset):
        queryset.update(status='published', published_at=timezone.now())
        self.message_user(request, f"{queryset.count()} posts published successfully.")
    publish_posts.short_description = "Publish selected posts"
    
    def archive_posts(self, request, queryset):
        queryset.update(status='archived')
        self.message_user(request, f"{queryset.count()} posts archived.")
    archive_posts.short_description = "Archive selected posts"
    
    def feature_posts(self, request, queryset):
        queryset.update(is_featured=True)
        self.message_user(request, f"{queryset.count()} posts featured.")
    feature_posts.short_description = "Feature selected posts"
    
    def unfeature_posts(self, request, queryset):
        queryset.update(is_featured=False)
        self.message_user(request, f"{queryset.count()} posts unfeatured.")
    unfeature_posts.short_description = "Unfeature selected posts"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = [
        'get_author_name',
        'post',
        'content_preview',
        'is_approved',
        'created_at'
    ]
    list_filter = ['is_approved', 'created_at']
    search_fields = ['content', 'guest_name', 'guest_email']
    list_editable = ['is_approved']
    
    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else obj.guest_name
    get_author_name.short_description = 'Author'
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Comment'
    
    actions = ['approve_comments', 'unapprove_comments']
    
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f"{queryset.count()} comments approved.")
    approve_comments.short_description = "Approve selected comments"
    
    def unapprove_comments(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, f"{queryset.count()} comments unapproved.")
    unapprove_comments.short_description = "Unapprove selected comments"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'email',
        'inquiry_type',
        'subject',
        'status_display',
        'created_at'
    ]
    list_filter = [
        'inquiry_type',
        'is_read',
        'is_replied',
        'created_at'
    ]
    search_fields = ['name', 'email', 'subject', 'message']
    readonly_fields = ['created_at', 'ip_address', 'user_agent']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message', {
            'fields': ('inquiry_type', 'subject', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'is_replied', 'replied_at', 'replied_by', 'notes')
        }),
        ('Tracking', {
            'fields': ('ip_address', 'user_agent', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_display(self, obj):
        if obj.is_replied:
            return format_html('<span style="color: green;">✓ Replied</span>')
        elif obj.is_read:
            return format_html('<span style="color: orange;">Read</span>')
        else:
            return format_html('<span style="color: red;">● New</span>')
    status_display.short_description = 'Status'
    
    actions = ['mark_as_read', 'mark_as_replied']
    
    def mark_as_read(self, request, queryset):
        for message in queryset:
            message.mark_as_read()
        self.message_user(request, f"{queryset.count()} messages marked as read.")
    mark_as_read.short_description = "Mark as read"
    
    def mark_as_replied(self, request, queryset):
        for message in queryset:
            message.mark_as_replied(request.user)
        self.message_user(request, f"{queryset.count()} messages marked as replied.")
    mark_as_replied.short_description = "Mark as replied"


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'is_active', 'subscribed_at']
    list_filter = ['is_active', 'subscribed_at']
    search_fields = ['email', 'name']
    actions = ['unsubscribe_selected']
    
    def unsubscribe_selected(self, request, queryset):
        for subscriber in queryset:
            subscriber.unsubscribe()
        self.message_user(request, f"{queryset.count()} subscribers unsubscribed.")
    unsubscribe_selected.short_description = "Unsubscribe selected"