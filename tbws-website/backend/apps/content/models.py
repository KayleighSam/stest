from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from ckeditor_uploader.fields import RichTextUploadingField
from apps.users.models import User


class Category(models.Model):
    """Categories for blog posts and news"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#007bff', help_text="Hex color code")
    icon = models.CharField(max_length=50, blank=True, help_text="FontAwesome icon class")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        db_table = 'content_categories'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    @property
    def post_count(self):
        return self.posts.filter(status='published').count()


class Tag(models.Model):
    """Tags for posts"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        db_table = 'content_tags'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Post(models.Model):
    """Blog posts, news articles, and event announcements"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    POST_TYPE_CHOICES = [
        ('news', 'News'),
        ('event', 'Event'),
        ('blog', 'Blog Post'),
        ('announcement', 'Announcement'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    post_type = models.CharField(max_length=20, choices=POST_TYPE_CHOICES, default='news')
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='posts'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')
    
    # Content
    excerpt = models.TextField(max_length=300, help_text="Brief summary (max 300 characters)")
    content = RichTextUploadingField()
    featured_image = models.ImageField(upload_to='posts/%Y/%m/', blank=True, null=True)
    image_caption = models.CharField(max_length=200, blank=True)
    
    # Event-specific fields
    event_date = models.DateTimeField(null=True, blank=True, help_text="For events only")
    event_end_date = models.DateTimeField(null=True, blank=True, help_text="For multi-day events")
    event_location = models.CharField(max_length=200, blank=True)
    event_venue = models.CharField(max_length=200, blank=True)
    event_registration_link = models.URLField(blank=True)
    
    # Publishing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Features
    is_featured = models.BooleanField(default=False, help_text="Show on homepage")
    is_pinned = models.BooleanField(default=False, help_text="Keep at top of list")
    allow_comments = models.BooleanField(default=True)
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=200, blank=True)
    
    # Tracking
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-published_at', '-created_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['status', 'post_type']),
            models.Index(fields=['slug']),
        ]
        db_table = 'content_posts'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Auto-publish when status changes to published
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        self.views += 1
        self.save(update_fields=['views'])
    
    @property
    def is_event(self):
        return self.post_type == 'event'
    
    @property
    def is_upcoming_event(self):
        if self.is_event and self.event_date:
            return self.event_date > timezone.now()
        return False
    
    @property
    def reading_time(self):
        """Estimate reading time in minutes"""
        word_count = len(self.content.split())
        return max(1, round(word_count / 200))


class Comment(models.Model):
    """Comments on posts"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments', null=True, blank=True)
    
    # For non-authenticated users
    guest_name = models.CharField(max_length=100, blank=True)
    guest_email = models.EmailField(blank=True)
    
    content = models.TextField()
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        db_table = 'content_comments'
    
    def __str__(self):
        author_name = self.author.get_full_name() if self.author else self.guest_name
        return f"{author_name} on {self.post.title}"


class ContactMessage(models.Model):
    """Contact form submissions"""
    INQUIRY_TYPE_CHOICES = [
        ('general', 'General Inquiry'),
        ('membership', 'Membership'),
        ('sponsorship', 'Sponsorship'),
        ('media', 'Media Inquiry'),
        ('other', 'Other'),
    ]
    
    # Contact Information
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Message Details
    inquiry_type = models.CharField(max_length=20, choices=INQUIRY_TYPE_CHOICES, default='general')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    # Status
    is_read = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
    replied_at = models.DateTimeField(null=True, blank=True)
    replied_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='contact_replies'
    )
    notes = models.TextField(blank=True, help_text="Internal notes")
    
    # Tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'content_contact_messages'
    
    def __str__(self):
        return f"{self.name} - {self.subject}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])
    
    def mark_as_replied(self, user):
        self.is_replied = True
        self.replied_at = timezone.now()
        self.replied_by = user
        self.save(update_fields=['is_replied', 'replied_at', 'replied_by'])


class Newsletter(models.Model):
    """Newsletter subscribers"""
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-subscribed_at']
        db_table = 'content_newsletter'
    
    def __str__(self):
        return self.email
    
    def unsubscribe(self):
        self.is_active = False
        self.unsubscribed_at = timezone.now()
        self.save()