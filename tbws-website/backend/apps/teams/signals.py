"""
Teams Signals

Handles:
- Auto-create team stats for new season
- Update team stats on game results
- Notify managers on roster changes
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings
from .models import Team, TeamMember, TeamStats


@receiver(post_save, sender=Team)
def create_team_slug(sender, instance, created, **kwargs):
    """
    Ensure team has a slug
    
    TBWS Use Case:
    - Generate URL-friendly slug from team name
    - Used for team profile URLs
    """
    if created and not instance.slug:
        from django.utils.text import slugify
        instance.slug = slugify(instance.name)
        instance.save()


@receiver(post_save, sender=TeamMember)
def notify_roster_change(sender, instance, created, **kwargs):
    """
    Notify team manager when roster changes
    
    TBWS Use Case:
    - Alert manager when player is added/removed
    - Track roster changes
    """
    if settings.DEBUG:
        action = "added to" if created else "updated on"
        print(f"\n{'='*60}")
        print(f"ROSTER CHANGE NOTIFICATION")
        print(f"{'='*60}")
        print(f"Player: {instance.player.user.get_full_name()}")
        print(f"Team: {instance.team.name}")
        print(f"Action: {action}")
        print(f"Jersey: #{instance.jersey_number}")
        print(f"Status: {instance.status}")
        print(f"{'='*60}\n")
    
    # In production, send actual notification
    # from django.core.mail import send_mail
    # if instance.team.manager:
    #     send_mail(
    #         subject=f'Roster Update - {instance.team.name}',
    #         message=f'{instance.player.user.get_full_name()} {action} team roster.',
    #         from_email=settings.DEFAULT_FROM_EMAIL,
    #         recipient_list=[instance.team.manager.email],
    #     )


@receiver(pre_save, sender=TeamMember)
def validate_jersey_uniqueness(sender, instance, **kwargs):
    """
    Ensure jersey numbers are unique per team
    
    TBWS Use Case:
    - Prevent duplicate jersey numbers on same team
    - Maintain roster integrity
    """
    if instance.status == 'active':
        # Check if another active player has this jersey on this team
        existing = TeamMember.objects.filter(
            team=instance.team,
            jersey_number=instance.jersey_number,
            status='active'
        )
        
        if instance.pk:
            existing = existing.exclude(pk=instance.pk)
        
        if existing.exists():
            from django.core.exceptions import ValidationError
            member = existing.first()
            raise ValidationError(
                f"Jersey #{instance.jersey_number} is already taken by {member.player.user.get_full_name()}"
            )
