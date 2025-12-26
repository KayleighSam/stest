from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from rest_framework import generics

from .models import Category, Tag, Post, Comment, ContactMessage, Newsletter
from .serializers import (
    CategorySerializer,
    TagSerializer,
    PostListSerializer,
    PostDetailSerializer,
    PostCreateUpdateSerializer,
    CommentSerializer,
    ContactMessageSerializer,
    NewsletterSerializer
)
from .permissions import IsAuthorOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):  # Changed from ReadOnlyModelViewSet
    """ViewSet for categories - Full CRUD"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class TagViewSet(viewsets.ModelViewSet):  # Changed from ReadOnlyModelViewSet
    """ViewSet for tags - Full CRUD"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class PostViewSet(viewsets.ModelViewSet):
    """ViewSet for managing posts (news, events, blog posts)"""
    queryset = Post.objects.all().select_related('author', 'category').prefetch_related('tags', 'comments')
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['post_type', 'category', 'tags', 'is_featured', 'status']
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'views', 'created_at']
    ordering = ['-is_pinned', '-published_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PostCreateUpdateSerializer
        return PostListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Admin can see all posts
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        
        # Public users only see published posts
        queryset = queryset.filter(status='published')
        
        # Filter by post type from query params
        post_type = self.request.query_params.get('type', None)
        if post_type:
            queryset = queryset.filter(post_type=post_type)
        
        # Featured posts only
        if self.request.query_params.get('featured') == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Upcoming events
        if self.request.query_params.get('upcoming_events') == 'true':
            queryset = queryset.filter(
                post_type='event',
                event_date__gte=timezone.now()
            )
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured posts"""
        featured_posts = self.get_queryset().filter(is_featured=True)[:6]
        serializer = self.get_serializer(featured_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest posts"""
        latest_posts = self.get_queryset()[:10]
        serializer = self.get_serializer(latest_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def publish(self, request, slug=None):
        """Publish a post"""
        post = self.get_object()
        post.status = 'published'
        if not post.published_at:
            post.published_at = timezone.now()
        post.save()
        return Response({'message': 'Post published successfully'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unpublish(self, request, slug=None):
        """Unpublish a post"""
        post = self.get_object()
        post.status = 'draft'
        post.save()
        return Response({'message': 'Post unpublished successfully'})


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing comments"""
    queryset = Comment.objects.all().select_related('author', 'post')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post', 'is_approved']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Admin sees all comments
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        # Public sees only approved comments
        return queryset.filter(is_approved=True, parent=None)
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(author=self.request.user)
        else:
            serializer.save()


class ContactMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for contact messages"""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['inquiry_type', 'is_read', 'is_replied']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        message = self.get_object()
        message.mark_as_read()
        return Response({'message': 'Marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_replied(self, request, pk=None):
        """Mark message as replied"""
        message = self.get_object()
        message.mark_as_replied(request.user)
        return Response({'message': 'Marked as replied'})


class NewsletterViewSet(viewsets.ModelViewSet):
    """ViewSet for newsletter subscriptions"""
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'name']
    ordering = ['-subscribed_at']


class ContactMessageCreateView(generics.CreateAPIView):
    """Public endpoint for creating contact messages"""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'message': 'Your message has been sent successfully.'},
            status=status.HTTP_201_CREATED
        )


class NewsletterSubscribeView(generics.CreateAPIView):
    """Public endpoint for newsletter subscriptions"""
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'message': 'Successfully subscribed to newsletter!'},
            status=status.HTTP_201_CREATED
        )
class ContactMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for contact messages"""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['inquiry_type', 'is_read', 'is_replied']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        message = self.get_object()
        message.mark_as_read()
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_replied(self, request, pk=None):
        """Mark message as replied"""
        message = self.get_object()
        notes = request.data.get('notes', '')
        if notes:
            message.notes = notes
        message.mark_as_replied(request.user)
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_notes(self, request, pk=None):
        """Update internal notes"""
        message = self.get_object()
        notes = request.data.get('notes', '')
        message.notes = notes
        message.save(update_fields=['notes'])
        serializer = self.get_serializer(message)
        return Response(serializer.data)