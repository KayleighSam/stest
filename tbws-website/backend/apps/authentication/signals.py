"""
Authentication Signals

Handles:
- Auto-create email verification token on user registration
- Clean up expired tokens
- Send welcome emails
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from apps.users.models import User
from .models import EmailVerificationToken


@receiver(post_save, sender=User)
def create_email_verification_token(sender, instance, created, **kwargs):
    """
    Create email verification token when new user registers
    
    TBWS Use Case:
    - New player registers
    - Automatically send verification email
    - Ensure valid email for communications
    """
    if created and not instance.email_verified:
        # Create verification token
        token = EmailVerificationToken.objects.create(user=instance)
        
        # TODO: Send verification email
        # For now, just print in development
        if settings.DEBUG:
            verify_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/verify-email/{token.token}"
            print(f"\n{'='*60}")
            print(f"EMAIL VERIFICATION TOKEN CREATED")
            print(f"{'='*60}")
            print(f"User: {instance.email}")
            print(f"Token: {token.token}")
            print(f"Verification URL: {verify_url}")
            print(f"Expires: {token.expires_at}")
            print(f"{'='*60}\n")
        
        # In production, send actual email:
        # from django.core.mail import send_mail
        # send_mail(
        #     subject='Verify Your Email - TBWS',
        #     message=f'Click here to verify: {verify_url}',
        #     from_email=settings.DEFAULT_FROM_EMAIL,
        #     recipient_list=[instance.email],
        # )
