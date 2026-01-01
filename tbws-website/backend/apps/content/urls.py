from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    TagViewSet,
    PostViewSet,
    CommentViewSet,
    ContactMessageViewSet,
    NewsletterViewSet,
    ContactMessageCreateView,
    NewsletterSubscribeView
)

app_name = 'content'

# Router for ViewSets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'contactmessage', ContactMessageViewSet, basename='contactmessage')
router.register(r'newsletter', NewsletterViewSet, basename='newsletter')

urlpatterns = [
    # Public endpoints MUST come BEFORE router to avoid conflicts
    path('contact/', ContactMessageCreateView.as_view(), name='contact-create'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    
    # Include router URLs last
    path('', include(router.urls)),
]