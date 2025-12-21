"""
Authentication Models

Handles:
- Password reset tokens
- Email verification tokens
- Login history tracking
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.crypto import get_random_string
import uuid


class PasswordResetToken(models.Model):
    """
    Model to store password reset tokens
    
    TBWS Use Case:
    - Player forgets password
    - Admin resets user password
    - Secure token-based password reset
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )
    token = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text='Unique token for password reset'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        help_text='Token expiration time (24 hours from creation)'
    )
    is_used = models.BooleanField(
        default=False,
        help_text='Whether token has been used'
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address that requested reset'
    )
    
    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
        indexes = [
            models.Index(fields=['token'], name='pwd_reset_token_idx'),
            models.Index(fields=['user', '-created_at'], name='pwd_reset_user_idx'),
        ]
    
    def __str__(self):
        return f"Password Reset for {self.user.email} - {self.token}"
    
    def save(self, *args, **kwargs):
        """Set expiration to 24 hours from creation"""
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)
    
    @property
    def is_valid(self):
        """Check if token is still valid (not expired and not used)"""
        return not self.is_used and timezone.now() < self.expires_at
    
    def mark_as_used(self):
        """Mark token as used"""
        self.is_used = True
        self.save()


class EmailVerificationToken(models.Model):
    """
    Model to store email verification tokens
    
    TBWS Use Case:
    - New player registration requires email verification
    - Ensure valid email addresses for communication
    - Prevent spam registrations
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='email_verification_tokens'
    )
    token = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text='Unique token for email verification'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        help_text='Token expiration time (48 hours from creation)'
    )
    is_verified = models.BooleanField(
        default=False,
        help_text='Whether email has been verified'
    )
    
    class Meta:
        db_table = 'email_verification_tokens'
        ordering = ['-created_at']
        verbose_name = 'Email Verification Token'
        verbose_name_plural = 'Email Verification Tokens'
        indexes = [
            models.Index(fields=['token'], name='email_verify_token_idx'),
            models.Index(fields=['user', '-created_at'], name='email_verify_user_idx'),
        ]
    
    def __str__(self):
        return f"Email Verification for {self.user.email} - {self.token}"
    
    def save(self, *args, **kwargs):
        """Set expiration to 48 hours from creation"""
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=48)
        super().save(*args, **kwargs)
    
    @property
    def is_valid(self):
        """Check if token is still valid (not expired and not verified)"""
        return not self.is_verified and timezone.now() < self.expires_at
    
    def mark_as_verified(self):
        """Mark token as verified"""
        self.is_verified = True
        self.user.email_verified = True
        self.user.save()
        self.save()


class LoginHistory(models.Model):
    """
    Model to track user login history
    
    TBWS Use Case:
    - Security monitoring
    - Detect suspicious login attempts
    - User activity tracking
    - Admin audit trail
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='login_history'
    )
    login_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address of login'
    )
    user_agent = models.TextField(
        blank=True,
        help_text='Browser/device user agent'
    )
    location = models.CharField(
        max_length=255,
        blank=True,
        help_text='Approximate location (city, country)'
    )
    success = models.BooleanField(
        default=True,
        help_text='Whether login was successful'
    )
    failure_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text='Reason for failed login'
    )
    
    class Meta:
        db_table = 'login_history'
        ordering = ['-login_time']
        verbose_name = 'Login History'
        verbose_name_plural = 'Login Histories'
        indexes = [
            models.Index(fields=['user', '-login_time'], name='login_hist_user_idx'),
            models.Index(fields=['-login_time'], name='login_hist_time_idx'),
        ]
    
    def __str__(self):
        status = "Success" if self.success else "Failed"
        return f"{self.user.email} - {status} - {self.login_time}"
