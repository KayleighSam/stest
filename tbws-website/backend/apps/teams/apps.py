"""
Teams App Configuration
"""

from django.apps import AppConfig


class TeamsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.teams'
    verbose_name = 'Teams'
    
    def ready(self):
        """Import signals when app is ready"""
        import apps.teams.signals
