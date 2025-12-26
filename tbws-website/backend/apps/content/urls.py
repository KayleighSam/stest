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

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'contactmessage', ContactMessageViewSet, basename='contactmessage')  # ADDED
router.register(r'newsletter', NewsletterViewSet, basename='newsletter')  # ADDED

urlpatterns = [
    path('', include(router.urls)),
    # Public endpoints for contact form and newsletter
    path('contact/', ContactMessageCreateView.as_view(), name='contact-create'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
]