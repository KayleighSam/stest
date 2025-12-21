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


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing tags
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing posts (news, events, blog posts)
    """
    queryset = Post.objects.filter(status='published').select_related('author', 'category').prefetch_related('tags', 'comments')
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['post_type', 'category', 'tags', 'is_featured']
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
    
    @action(detail=False, methods=['get'], url_path='upcoming-events')
    def upcoming_events(self, request):
        """Get upcoming events"""
        events = self.get_queryset().filter(
            post_type='event',
            event_date__gte=timezone.now()
        ).order_by('event_date')[:20]
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='past-events')
    def past_events(self, request):
        """Get past events"""
        events = self.get_queryset().filter(
            post_type='event',
            event_date__lt=timezone.now()
        ).order_by('-event_date')[:20]
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related posts"""
        post = self.get_object()
        related = Post.objects.filter(
            Q(category=post.category) | Q(tags__in=post.tags.all()),
            status='published'
        ).exclude(id=post.id).distinct()[:5]
        serializer = self.get_serializer(related, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing comments
    """
    queryset = Comment.objects.filter(is_approved=True, parent=None).select_related('author', 'post')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post']
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(author=self.request.user)
        else:
            serializer.save()


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for contact messages
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post']
    
    def get_permissions(self):
        if self.action == 'list':
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Your message has been sent successfully. We will get back to you soon.',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class NewsletterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for newsletter subscriptions
    """
    queryset = Newsletter.objects.filter(is_active=True)
    serializer_class = NewsletterSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post', 'delete']
    
    def get_permissions(self):
        if self.action == 'list':
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Successfully subscribed to newsletter!',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=False, methods=['post'])
    def unsubscribe(self, request):
        """Unsubscribe from newsletter"""
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subscriber = Newsletter.objects.get(email=email, is_active=True)
            subscriber.unsubscribe()
            return Response({'message': 'Successfully unsubscribed from newsletter'})
        except Newsletter.DoesNotExist:
            return Response(
                {'error': 'Email not found in our subscription list'},
                status=status.HTTP_404_NOT_FOUND
            )


class ContactMessageCreateView(generics.CreateAPIView):
    """
    API endpoint for creating contact messages (public)
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Your message has been sent successfully. We will get back to you soon.',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class NewsletterSubscribeView(generics.CreateAPIView):
    """
    API endpoint for newsletter subscriptions (public)
    """
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Successfully subscribed to newsletter!',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )