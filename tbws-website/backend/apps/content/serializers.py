from rest_framework import serializers
from .models import Category, Tag, Post, Comment, ContactMessage, Newsletter
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'color',
            'icon',
            'post_count',
            'created_at'
        ]
        read_only_fields = ['slug', 'created_at']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug']


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_slug = serializers.CharField(source='post.slug', read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id',
            'post',
            'post_title',
            'post_slug',
            'author',
            'author_name',
            'guest_name',
            'guest_email',
            'content',
            'parent',
            'replies',
            'is_approved',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name()
        return obj.guest_name
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_approved=True), many=True).data
        return []


class PostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    reading_time = serializers.ReadOnlyField()
    is_upcoming_event = serializers.ReadOnlyField()
    comment_count = serializers.SerializerMethodField()
    approved_comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'post_type',
            'category',
            'category_name',
            'excerpt',
            'featured_image',
            'author',
            'author_name',
            'published_at',
            'created_at',
            'event_date',
            'event_location',
            'is_featured',
            'is_pinned',
            'status',
            'views',
            'reading_time',
            'is_upcoming_event',
            'comment_count',
            'approved_comment_count',
        ]
    
    def get_comment_count(self, obj):
        """Total comments (approved + pending)"""
        return obj.comments.count()
    
    def get_approved_comment_count(self, obj):
        """Only approved comments"""
        return obj.comments.filter(is_approved=True).count()


class PostDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single post view"""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    reading_time = serializers.ReadOnlyField()
    is_upcoming_event = serializers.ReadOnlyField()
    comment_count = serializers.SerializerMethodField()
    approved_comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'post_type',
            'category',
            'tags',
            'excerpt',
            'content',
            'featured_image',
            'image_caption',
            'event_date',
            'event_end_date',
            'event_location',
            'event_venue',
            'event_registration_link',
            'status',
            'author',
            'published_at',
            'is_featured',
            'is_pinned',
            'allow_comments',
            'comments',
            'comment_count',
            'approved_comment_count',
            'meta_description',
            'meta_keywords',
            'views',
            'reading_time',
            'is_upcoming_event',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['author', 'views', 'created_at', 'updated_at']
    
    def get_comment_count(self, obj):
        """Total comments (approved + pending)"""
        return obj.comments.count()
    
    def get_approved_comment_count(self, obj):
        """Only approved comments"""
        return obj.comments.filter(is_approved=True).count()


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating posts"""
    class Meta:
        model = Post
        fields = [
            'title',
            'post_type',
            'category',
            'tags',
            'excerpt',
            'content',
            'featured_image',
            'image_caption',
            'event_date',
            'event_end_date',
            'event_location',
            'event_venue',
            'event_registration_link',
            'status',
            'is_featured',
            'is_pinned',
            'allow_comments',
            'meta_description',
            'meta_keywords'
        ]
    
    def validate(self, data):
        # Validate event fields if post_type is event
        if data.get('post_type') == 'event':
            if not data.get('event_date'):
                raise serializers.ValidationError({
                    'event_date': 'Event date is required for event posts.'
                })
        return data


class ContactMessageSerializer(serializers.ModelSerializer):
    replied_by_name = serializers.CharField(source='replied_by.get_full_name', read_only=True)
    
    class Meta:
        model = ContactMessage
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'inquiry_type',
            'subject',
            'message',
            'is_read',
            'is_replied',
            'replied_at',
            'replied_by',
            'replied_by_name',
            'notes',
            'created_at'
        ]
        read_only_fields = ['is_read', 'is_replied', 'replied_at', 'replied_by', 'created_at']
    
    def create(self, validated_data):
        # Capture IP and User Agent from request
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['id', 'email', 'name', 'is_active', 'subscribed_at', 'unsubscribed_at']
        read_only_fields = ['subscribed_at', 'unsubscribed_at']
    
    def validate_email(self, value):
        # Check if email already exists and is active
        if Newsletter.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("This email is already subscribed.")
        return value