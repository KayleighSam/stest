from rest_framework import viewsets, filters, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

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


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for categories - Full CRUD"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class TagViewSet(viewsets.ModelViewSet):
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
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured posts"""
        featured_posts = self.get_queryset().filter(is_featured=True, status='published')[:6]
        serializer = self.get_serializer(featured_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest posts"""
        latest_posts = self.get_queryset().filter(status='published')[:10]
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
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unpublish(self, request, slug=None):
        """Unpublish a post (set to draft)"""
        post = self.get_object()
        post.status = 'draft'
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing comments"""
    queryset = Comment.objects.all().select_related('author', 'post')
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post', 'is_approved']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Allow anyone to create comments (guests can comment)
        Only staff can list all, update, delete, approve
        """
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['list', 'retrieve']:
            return [AllowAny()]
        else:
            return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        CRITICAL: Admin sees ALL comments, public sees only approved
        """
        queryset = super().get_queryset()
        
        # Staff/Admin users see ALL comments (no filtering)
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset.order_by('-created_at')
        
        # Public users see only approved comments
        return queryset.filter(is_approved=True).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """
        Override list to add debug logging
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Debug logging
        if request.user.is_authenticated and request.user.is_staff:
            total = queryset.count()
            approved = queryset.filter(is_approved=True).count()
            pending = queryset.filter(is_approved=False).count()
            logger.info(f"[ADMIN] Total: {total} | Approved: {approved} | Pending: {pending}")
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """
        ALL comments need approval by default
        Only staff comments are auto-approved
        """
        if self.request.user.is_authenticated and self.request.user.is_staff:
            serializer.save(author=self.request.user, is_approved=True)
        elif self.request.user.is_authenticated:
            serializer.save(author=self.request.user, is_approved=False)
        else:
            serializer.save(is_approved=False)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """Approve a comment"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff can approve comments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment = self.get_object()
        comment.is_approved = True
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unapprove(self, request, pk=None):
        """Unapprove a comment"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff can unapprove comments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment = self.get_object()
        comment.is_approved = False
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)


class ContactMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for contact messages - Admin only"""
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
        message.is_read = True
        message.save()
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_replied(self, request, pk=None):
        """Mark message as replied"""
        message = self.get_object()
        notes = request.data.get('notes', '')
        if notes:
            message.notes = notes
        message.is_replied = True
        message.replied_at = timezone.now()
        message.replied_by = request.user
        message.save()
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


class NewsletterViewSet(viewsets.ModelViewSet):
    """ViewSet for newsletter subscriptions - Admin only"""
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'name']
    ordering = ['-subscribed_at']
    
    @action(detail=True, methods=['post'])
    def unsubscribe(self, request, pk=None):
        """Unsubscribe a user"""
        subscriber = self.get_object()
        subscriber.unsubscribe()
        serializer = self.get_serializer(subscriber)
        return Response(serializer.data)


class ContactMessageCreateView(generics.CreateAPIView):
    """Public endpoint for creating contact messages"""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Contact form submission: {request.data.get('email')}")
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
        logger.info(f"Newsletter subscription attempt: {request.data}")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request path: {request.path}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        logger.info(f"Newsletter subscription successful: {request.data.get('email')}")
        return Response(
            {'message': 'Successfully subscribed to newsletter!'},
            status=status.HTTP_201_CREATED
        )