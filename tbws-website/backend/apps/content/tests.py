from django.test import TestCase
from django.utils import timezone
from apps.users.models import User
from .models import Category, Post, Tag, Comment, ContactMessage, Newsletter


class CategoryModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Basketball",
            description="Basketball related content"
        )
    
    def test_category_creation(self):
        self.assertEqual(self.category.name, "Basketball")
        self.assertEqual(self.category.slug, "basketball")
    
    def test_category_str(self):
        self.assertEqual(str(self.category), "Basketball")


class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User"
        )
        self.category = Category.objects.create(name="News")
        self.post = Post.objects.create(
            title="Test Post",
            excerpt="Test excerpt",
            content="Test content",
            post_type="news",
            category=self.category,
            author=self.user,
            status="published"
        )
    
    def test_post_creation(self):
        self.assertEqual(self.post.title, "Test Post")
        self.assertEqual(self.post.slug, "test-post")
        self.assertIsNotNone(self.post.published_at)
    
    def test_post_str(self):
        self.assertEqual(str(self.post), "Test Post")
    
    def test_increment_views(self):
        initial_views = self.post.views
        self.post.increment_views()
        self.assertEqual(self.post.views, initial_views + 1)


class ContactMessageModelTest(TestCase):
    def setUp(self):
        self.message = ContactMessage.objects.create(
            name="John Doe",
            email="john@example.com",
            subject="Test Subject",
            message="Test message"
        )
    
    def test_message_creation(self):
        self.assertEqual(self.message.name, "John Doe")
        self.assertFalse(self.message.is_read)
    
    def test_mark_as_read(self):
        self.message.mark_as_read()
        self.assertTrue(self.message.is_read)