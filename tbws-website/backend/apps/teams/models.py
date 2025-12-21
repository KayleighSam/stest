"""
Teams Models

Handles:
- Team information and management
- Team roster (player assignments)
- Team statistics and records
- Coach assignments
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Team(models.Model):
    """
    Team model for TBWS basketball teams
    
    TBWS Use Case:
    - Manage basketball teams in the league
    - Track team information, logo, colors
    - Assign coaches and managers
    - Track team status (active, inactive, disbanded)
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('disbanded', 'Disbanded'),
    ]
    
    DIVISION_CHOICES = [
        ('men', 'Men'),
        ('women', 'Women'),
        ('youth', 'Youth'),
        ('mixed', 'Mixed'),
    ]
    
    # Basic Information
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text='Team name (e.g., "Tusker Warriors")'
    )
    short_name = models.CharField(
        max_length=50,
        blank=True,
        help_text='Short name or abbreviation (e.g., "Warriors")'
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text='URL-friendly name'
    )
    
    # Team Details
    founded_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date team was founded'
    )
    division = models.CharField(
        max_length=20,
        choices=DIVISION_CHOICES,
        default='men',
        help_text='Team division'
    )
    description = models.TextField(
        blank=True,
        help_text='Team description or history'
    )
    
    # Branding
    logo = models.ImageField(
        upload_to='teams/logos/',
        null=True,
        blank=True,
        help_text='Team logo'
    )
    primary_color = models.CharField(
        max_length=7,
        default='#1e3c72',
        help_text='Primary team color (hex code)'
    )
    secondary_color = models.CharField(
        max_length=7,
        default='#2a5298',
        help_text='Secondary team color (hex code)'
    )
    
    # Management
    head_coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coached_teams',
        help_text='Head coach of the team'
    )
    assistant_coaches = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='assistant_coached_teams',
        blank=True,
        help_text='Assistant coaches'
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_teams',
        help_text='Team manager'
    )
    
    # Contact Information
    email = models.EmailField(
        blank=True,
        help_text='Team contact email'
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text='Team contact phone'
    )
    home_venue = models.CharField(
        max_length=255,
        blank=True,
        help_text='Home court/venue'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text='Team status'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teams'
        ordering = ['name']
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'
        indexes = [
            models.Index(fields=['slug'], name='team_slug_idx'),
            models.Index(fields=['status', 'division'], name='team_status_div_idx'),
            models.Index(fields=['-created_at'], name='team_created_idx'),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def active_players_count(self):
        """Get count of active players on the team"""
        return self.members.filter(
            status='active',
            role='player'
        ).count()
    
    @property
    def wins(self):
        """Get team wins from stats"""
        stats = self.stats.first()
        return stats.wins if stats else 0
    
    @property
    def losses(self):
        """Get team losses from stats"""
        stats = self.stats.first()
        return stats.losses if stats else 0
    
    @property
    def win_percentage(self):
        """Calculate win percentage"""
        total_games = self.wins + self.losses
        if total_games == 0:
            return 0.0
        return round((self.wins / total_games) * 100, 2)


class TeamMember(models.Model):
    """
    Team roster - links players to teams
    
    TBWS Use Case:
    - Manage team rosters
    - Track player positions on team
    - Handle player trades/transfers
    - Track join and leave dates
    """
    
    ROLE_CHOICES = [
        ('player', 'Player'),
        ('captain', 'Captain'),
        ('vice_captain', 'Vice Captain'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('injured', 'Injured'),
        ('suspended', 'Suspended'),
        ('left', 'Left Team'),
    ]
    
    # Relationships
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='members',
        help_text='Team'
    )
    player = models.ForeignKey(
        'users.Player',
        on_delete=models.CASCADE,
        related_name='team_memberships',
        help_text='Player'
    )
    
    # Role and Status
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='player',
        help_text='Player role on team'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text='Membership status'
    )
    
    # Jersey Information
    jersey_number = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(99)],
        help_text='Jersey number (0-99)'
    )
    
    # Dates
    joined_date = models.DateField(
        default=timezone.now,
        help_text='Date joined team'
    )
    left_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date left team'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'team_members'
        ordering = ['jersey_number']
        verbose_name = 'Team Member'
        verbose_name_plural = 'Team Members'
        unique_together = [
            ('team', 'player'),
            ('team', 'jersey_number', 'status'),  # Unique jersey per active team
        ]
        indexes = [
            models.Index(fields=['team', 'status'], name='member_team_status_idx'),
            models.Index(fields=['player', 'status'], name='member_player_status_idx'),
        ]
    
    def __str__(self):
        return f"{self.player.user.get_full_name()} - {self.team.name} (#{self.jersey_number})"
    
    @property
    def is_active(self):
        """Check if membership is active"""
        return self.status == 'active'


class TeamStats(models.Model):
    """
    Team statistics and records
    
    TBWS Use Case:
    - Track team performance
    - Season records (wins, losses)
    - Points scored/allowed
    - Team rankings
    """
    
    # Relationship
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='stats',
        help_text='Team'
    )
    
    # Season Information
    season = models.CharField(
        max_length=20,
        help_text='Season (e.g., "2024", "2024-25")'
    )
    
    # Game Statistics
    games_played = models.PositiveIntegerField(
        default=0,
        help_text='Total games played'
    )
    wins = models.PositiveIntegerField(
        default=0,
        help_text='Total wins'
    )
    losses = models.PositiveIntegerField(
        default=0,
        help_text='Total losses'
    )
    
    # Points
    points_scored = models.PositiveIntegerField(
        default=0,
        help_text='Total points scored'
    )
    points_allowed = models.PositiveIntegerField(
        default=0,
        help_text='Total points allowed'
    )
    
    # Streaks
    current_streak = models.IntegerField(
        default=0,
        help_text='Current win/loss streak (positive for wins, negative for losses)'
    )
    longest_win_streak = models.PositiveIntegerField(
        default=0,
        help_text='Longest winning streak'
    )
    longest_loss_streak = models.PositiveIntegerField(
        default=0,
        help_text='Longest losing streak'
    )
    
    # Rankings
    league_rank = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Current league ranking'
    )
    division_rank = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Current division ranking'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'team_stats'
        ordering = ['-season', '-wins']
        verbose_name = 'Team Statistics'
        verbose_name_plural = 'Team Statistics'
        unique_together = [('team', 'season')]
        indexes = [
            models.Index(fields=['season', '-wins'], name='stats_season_wins_idx'),
            models.Index(fields=['team', 'season'], name='stats_team_season_idx'),
        ]
    
    def __str__(self):
        return f"{self.team.name} - {self.season} ({self.wins}-{self.losses})"
    
    @property
    def win_percentage(self):
        """Calculate win percentage"""
        if self.games_played == 0:
            return 0.0
        return round((self.wins / self.games_played) * 100, 2)
    
    @property
    def points_per_game(self):
        """Calculate average points per game"""
        if self.games_played == 0:
            return 0.0
        return round(self.points_scored / self.games_played, 2)
    
    @property
    def points_allowed_per_game(self):
        """Calculate average points allowed per game"""
        if self.games_played == 0:
            return 0.0
        return round(self.points_allowed / self.games_played, 2)
    
    @property
    def point_differential(self):
        """Calculate point differential"""
        return self.points_scored - self.points_allowed
