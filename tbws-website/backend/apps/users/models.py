from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom user model with additional fields for TBWS
    Extends Django's AbstractUser with role-based access and status tracking
    """
    
    ROLE_CHOICES = [
        ('player', 'Player'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
        ('super_admin', 'Super Admin'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    # Override email to make it unique and required
    email = models.EmailField(_('email address'), unique=True)
    
    # Additional fields
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='player',
        help_text='User role determines access level'
    )
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        help_text='Contact phone number'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active',
        help_text='Account status'
    )
    email_verified = models.BooleanField(
        default=False,
        help_text='Whether email has been verified'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as the unique identifier for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email'], name='users_email_idx'),
            models.Index(fields=['status'], name='users_status_idx'),
            models.Index(fields=['role'], name='users_role_idx'),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def is_player(self):
        """Check if user has player role"""
        return self.role == 'player'
    
    @property
    def is_manager(self):
        """Check if user has manager or higher privileges"""
        return self.role in ['manager', 'admin', 'super_admin']
    
    @property
    def is_admin(self):
        """Check if user has admin privileges"""
        return self.role in ['admin', 'super_admin']
    
    @property
    def is_super_admin(self):
        """Check if user has super admin privileges"""
        return self.role == 'super_admin'
    
    def can_manage_users(self):
        """Check if user can manage other users"""
        return self.is_admin
    
    def can_manage_content(self):
        """Check if user can manage content"""
        return self.is_manager


class Player(models.Model):
    """
    Player profile model
    One-to-one relationship with User model
    Contains basketball-specific information
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('retired', 'Retired'),
    ]
    
    POSITION_CHOICES = [
        ('PG', 'Point Guard'),
        ('SG', 'Shooting Guard'),
        ('SF', 'Small Forward'),
        ('PF', 'Power Forward'),
        ('C', 'Center'),
    ]
    
    # Relationship to User
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='player_profile',
        help_text='Related user account'
    )
    
    # Player information
    jersey_number = models.IntegerField(
        null=True, 
        blank=True,
        help_text='Player jersey number'
    )
    position = models.CharField(
        max_length=50, 
        blank=True,
        choices=POSITION_CHOICES,
        help_text='Primary playing position'
    )
    height = models.CharField(
        max_length=20, 
        blank=True,
        help_text='Player height (e.g., 6\'2")'
    )
    weight = models.CharField(
        max_length=20, 
        blank=True,
        help_text='Player weight (e.g., 180 lbs)'
    )
    hometown = models.CharField(
        max_length=100, 
        blank=True,
        help_text='Player hometown'
    )
    bio = models.TextField(
        blank=True,
        help_text='Player biography'
    )
    profile_photo = models.ImageField(
        upload_to='players/photos/', 
        null=True, 
        blank=True,
        help_text='Player profile photo'
    )
    years_active = models.CharField(
        max_length=50, 
        blank=True,
        help_text='Years active (e.g., 2020-Present)'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active',
        help_text='Player status'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'players'
        ordering = ['user__last_name', 'user__first_name']
        verbose_name = 'Player'
        verbose_name_plural = 'Players'
        indexes = [
            models.Index(fields=['status'], name='players_status_idx'),
            models.Index(fields=['jersey_number'], name='players_jersey_idx'),
            models.Index(fields=['position'], name='players_position_idx'),
        ]
    
    def __str__(self):
        jersey = f"#{self.jersey_number}" if self.jersey_number else "No Jersey"
        return f"{self.user.get_full_name()} - {jersey}"
    
    @property
    def full_name(self):
        """Get player's full name"""
        return self.user.get_full_name()
    
    @property
    def display_name(self):
        """Get display name with jersey number"""
        if self.jersey_number:
            return f"#{self.jersey_number} {self.full_name}"
        return self.full_name
    
    def save(self, *args, **kwargs):
        """Override save to ensure user has player role"""
        if self.user.role != 'player':
            self.user.role = 'player'
            self.user.save()
        super().save(*args, **kwargs)