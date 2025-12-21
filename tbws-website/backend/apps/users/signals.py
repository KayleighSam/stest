from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Player

User = get_user_model()


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """
    Signal handler for User post-save
    Handles actions after a user is created or updated
    """
    if created:
        # User was just created
        # TODO: Send welcome email
        # TODO: Create default preferences
        pass
    else:
        # User was updated
        # TODO: Handle email verification changes
        # TODO: Handle status changes
        pass


@receiver(pre_delete, sender=User)
def user_pre_delete(sender, instance, **kwargs):
    """
    Signal handler for User pre-delete
    Cleanup before user is deleted
    """
    # TODO: Archive user data
    # TODO: Send notification to admins
    pass


@receiver(post_save, sender=Player)
def player_post_save(sender, instance, created, **kwargs):
    """
    Signal handler for Player post-save
    Handles actions after a player is created or updated
    """
    if created:
        # Player profile was just created
        # Ensure user has player role
        if instance.user.role != 'player':
            instance.user.role = 'player'
            instance.user.save(update_fields=['role'])
        
        # TODO: Send profile creation confirmation email
        # TODO: Notify admins of new player
        pass
    else:
        # Player profile was updated
        # TODO: Handle status changes
        # TODO: Log significant changes
        pass


@receiver(pre_delete, sender=Player)
def player_pre_delete(sender, instance, **kwargs):
    """
    Signal handler for Player pre-delete
    Cleanup before player is deleted
    """
    # TODO: Archive player stats
    # TODO: Handle team roster updates
    # TODO: Notify admins
    pass


# Future signal ideas:
# - Send email on email_verified change
# - Send email on password change
# - Send email on role change
# - Log all user status changes
# - Track login attempts
# - Handle profile photo updates (cleanup old photos)
# - Validate jersey number uniqueness within teams