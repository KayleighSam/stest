from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage, Comment


@receiver(post_save, sender=ContactMessage)
def notify_new_contact_message(sender, instance, created, **kwargs):
    """Send email notification when new contact message is received"""
    if created:
        subject = f'New Contact Message: {instance.subject}'
        message = f"""
        New contact message received from {instance.name}
        
        Email: {instance.email}
        Phone: {instance.phone}
        Inquiry Type: {instance.get_inquiry_type_display()}
        Subject: {instance.subject}
        
        Message:
        {instance.message}
        """
        
        # Send email to admin (configure in settings)
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.CONTACT_EMAIL],  # Add this to settings
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")


@receiver(post_save, sender=Comment)
def notify_new_comment(sender, instance, created, **kwargs):
    """Notify post author of new comment"""
    if created and instance.post.author.email:
        subject = f'New comment on your post: {instance.post.title}'
        author_name = instance.author.get_full_name() if instance.author else instance.guest_name
        message = f"""
        {author_name} commented on your post "{instance.post.title}"
        
        Comment:
        {instance.content}
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [instance.post.author.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")