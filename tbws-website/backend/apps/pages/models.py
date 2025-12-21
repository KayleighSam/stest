from django.db import models
from django.utils.text import slugify
from ckeditor_uploader.fields import RichTextUploadingField


class Page(models.Model):
    """Static pages like About, Privacy Policy, etc."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    content = RichTextUploadingField()
    hero_image = models.ImageField(upload_to='pages/hero/', blank=True, null=True)
    featured_image = models.ImageField(upload_to='pages/featured/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['title']
        db_table = 'pages_page'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class SiteSettings(models.Model):
    """Global site settings (singleton)"""
    site_name = models.CharField(max_length=100, default='TBWS')
    tagline = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    
    # About Section Content
    about_title = models.CharField(max_length=200, default='About TBWS', blank=True)
    about_content = RichTextUploadingField(blank=True, help_text="Main about content")
    about_image = models.ImageField(upload_to='site/', blank=True, null=True)
    
    # Hero Section - ADD THIS BACK!
    hero_image = models.ImageField(upload_to='site/hero/', blank=True, null=True, help_text="Main hero section image")
    
    # Mission & Vision
    mission_title = models.CharField(max_length=200, default='Our Mission', blank=True)
    mission_content = RichTextUploadingField(blank=True)
    vision_title = models.CharField(max_length=200, default='Our Vision', blank=True)
    vision_content = RichTextUploadingField(blank=True)
    
    # Contact Information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Social Media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=200, blank=True)
    
    # Branding
    logo = models.ImageField(upload_to='site/', blank=True, null=True, help_text="Main site logo")
    favicon = models.ImageField(upload_to='site/', blank=True, null=True, help_text="Browser favicon")
    
    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'
        db_table = 'pages_site_settings'
    
    def __str__(self):
        return f"{self.site_name} Settings"
    
    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class CoreValue(models.Model):
    """Core values for the organization"""
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Icon name (award, users, target, heart, sparkles, trending)")
    color_start = models.CharField(max_length=50, default='#3b82f6', help_text="Gradient start color (hex)")
    color_end = models.CharField(max_length=50, default='#60a5fa', help_text="Gradient end color (hex)")
    order = models.IntegerField(default=0, help_text="Display order")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'title']
        db_table = 'pages_core_values'
    
    def __str__(self):
        return self.title


class TeamMember(models.Model):
    """Team members"""
    ROLE_CHOICES = [
        ('president', 'President'),
        ('vice_president', 'Vice President'),
        ('secretary', 'Secretary'),
        ('treasurer', 'Treasurer'),
        ('committee', 'Committee Member'),
        ('coach', 'Coach'),
        ('staff', 'Staff'),
    ]
    
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    title = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='team/', blank=True, null=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Social Media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    joined_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
        db_table = 'pages_team_members'
    
    def __str__(self):
        return f"{self.name} - {self.get_role_display()}"
    
    @property
    def role_display(self):
        return self.get_role_display()


class FAQ(models.Model):
    """Frequently Asked Questions"""
    question = models.CharField(max_length=300)
    answer = RichTextUploadingField()
    category = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
        db_table = 'pages_faq'
    
    def __str__(self):
        return self.question


class HistoryTimeline(models.Model):
    """Organization history timeline"""
    year = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='history/', blank=True, null=True)
    is_milestone = models.BooleanField(default=False, help_text="Mark as a major milestone")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', '-year']
        db_table = 'pages_history_timeline'
    
    def __str__(self):
        return f"{self.year} - {self.title}"


class Sponsor(models.Model):
    """Organization sponsors"""
    TIER_CHOICES = [
        ('platinum', 'Platinum'),
        ('gold', 'Gold'),
        ('silver', 'Silver'),
        ('bronze', 'Bronze'),
        ('partner', 'Partner'),
    ]
    
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='sponsors/')
    website_url = models.URLField(blank=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='partner')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    started_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
        db_table = 'pages_sponsors'
    
    def __str__(self):
        return f"{self.name} ({self.get_tier_display()})"



# League Rules Model
class LeagueRule(models.Model):
    """League rules and regulations"""
    CATEGORY_CHOICES = [
        ('game_rules', 'Game Rules'),
        ('player_rules', 'Player Rules'),
        ('team_rules', 'Team Rules'),
        ('conduct', 'Code of Conduct'),
        ('eligibility', 'Eligibility'),
        ('other', 'Other'),
    ]
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    content = RichTextUploadingField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'order', 'title']
        db_table = 'pages_league_rules'
        verbose_name = 'League Rule'
        verbose_name_plural = 'League Rules'
    
    def __str__(self):
        return f"{self.get_category_display()} - {self.title}"


class Venue(models.Model):
    """Basketball courts and facilities"""
    name = models.CharField(max_length=200)
    address = models.TextField()
    description = RichTextUploadingField(blank=True)
    
    # Court Specifications
    court_type = models.CharField(max_length=100, blank=True, help_text="e.g., Indoor, Outdoor, Hardwood")
    court_dimensions = models.CharField(max_length=100, blank=True, help_text="e.g., Full court, Half court")
    surface_type = models.CharField(max_length=100, blank=True, help_text="e.g., Hardwood, Concrete, Asphalt")
    
    # Facilities
    facilities = RichTextUploadingField(blank=True, help_text="Locker rooms, parking, seating, etc.")
    capacity = models.IntegerField(null=True, blank=True, help_text="Spectator capacity")
    
    # Media
    featured_image = models.ImageField(upload_to='venues/', blank=True, null=True)
    gallery_images = models.TextField(blank=True, help_text="Comma-separated image URLs")
    
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    map_embed_code = models.TextField(blank=True, help_text="Google Maps embed iframe code")
    
    # Contact
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False, help_text="Primary home court")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'order', 'name']
        db_table = 'pages_venues'
    
    def __str__(self):
        return self.name


class DraftInfo(models.Model):
    """Draft process information (Singleton)"""
    title = models.CharField(max_length=200, default="TBWS Draft Process")
    
    # Overview
    overview = RichTextUploadingField(blank=True, help_text="General overview of the draft")
    
    # Eligibility
    eligibility_title = models.CharField(max_length=200, default="Eligibility Requirements", blank=True)
    eligibility_content = RichTextUploadingField(blank=True)
    
    # Process
    process_title = models.CharField(max_length=200, default="How It Works", blank=True)
    process_content = RichTextUploadingField(blank=True, help_text="Step-by-step draft process")
    
    # Timeline
    timeline_title = models.CharField(max_length=200, default="Draft Timeline", blank=True)
    timeline_content = RichTextUploadingField(blank=True)
    
    # Rules
    rules_title = models.CharField(max_length=200, default="Draft Rules", blank=True)
    rules_content = RichTextUploadingField(blank=True)
    
    # FAQ
    faq_title = models.CharField(max_length=200, default="Draft FAQ", blank=True)
    faq_content = RichTextUploadingField(blank=True)
    
    # Important Dates
    registration_deadline = models.DateTimeField(null=True, blank=True)
    draft_date = models.DateTimeField(null=True, blank=True)
    
    # Media
    featured_image = models.ImageField(upload_to='draft/', blank=True, null=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Draft Information'
        verbose_name_plural = 'Draft Information'
        db_table = 'pages_draft_info'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton)
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class ManagerInfo(models.Model):
    """Team manager information and responsibilities"""
    title = models.CharField(max_length=200, default="Team Manager Information")
    
    # Overview
    overview = RichTextUploadingField(blank=True, help_text="What is a team manager?")
    
    # Responsibilities
    responsibilities_title = models.CharField(max_length=200, default="Manager Responsibilities", blank=True)
    responsibilities_content = RichTextUploadingField(blank=True)
    
    # Requirements
    requirements_title = models.CharField(max_length=200, default="Requirements", blank=True)
    requirements_content = RichTextUploadingField(blank=True)
    
    # Benefits
    benefits_title = models.CharField(max_length=200, default="Benefits", blank=True)
    benefits_content = RichTextUploadingField(blank=True)
    
    # How to Become
    how_to_become_title = models.CharField(max_length=200, default="How to Become a Manager", blank=True)
    how_to_become_content = RichTextUploadingField(blank=True)
    
    # Contact
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Manager Information'
        verbose_name_plural = 'Manager Information'
        db_table = 'pages_manager_info'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton)
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class Manager(models.Model):
    """Individual team managers"""
    name = models.CharField(max_length=100)
    team_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='managers/', blank=True, null=True)
    
    # Contact
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Social Media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    
    # Status
    years_experience = models.IntegerField(null=True, blank=True, help_text="Years as manager")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    joined_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
        db_table = 'pages_managers'
    
    def __str__(self):
        if self.team_name:
            return f"{self.name} - {self.team_name}"
        return self.name