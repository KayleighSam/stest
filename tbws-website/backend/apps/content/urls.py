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

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-create'),
    path('newsletter/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
]