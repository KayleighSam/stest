"""
Teams Admin Configuration
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Team, TeamMember, TeamStats


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    """Admin configuration for teams"""
    
    list_display = [
        'name',
        'division',
        'logo_preview',
        'status',
        'active_players',
        'record',
        'head_coach',
        'created_at',
    ]
    list_filter = ['status', 'division', 'created_at']
    search_fields = ['name', 'short_name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'logo_preview']
    filter_horizontal = ['assistant_coaches']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'short_name', 'slug', 'founded_date', 'division')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Branding', {
            'fields': ('logo', 'logo_preview', 'primary_color', 'secondary_color')
        }),
        ('Management', {
            'fields': ('head_coach', 'assistant_coaches', 'manager')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'home_venue')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def logo_preview(self, obj):
        """Display logo preview"""
        if obj.logo:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 5px;" />',
                obj.logo.url
            )
        return '-'
    logo_preview.short_description = 'Logo'
    
    def active_players(self, obj):
        """Display count of active players"""
        count = obj.active_players_count
        return format_html(
            '<span style="font-weight: bold;">{}</span>',
            count
        )
    active_players.short_description = 'Players'
    
    def record(self, obj):
        """Display team record (wins-losses)"""
        return f"{obj.wins}-{obj.losses}"
    record.short_description = 'Record'
    
    actions = ['activate_teams', 'deactivate_teams']
    
    def activate_teams(self, request, queryset):
        """Bulk action to activate teams"""
        count = queryset.update(status='active')
        self.message_user(request, f'{count} team(s) activated successfully.')
    activate_teams.short_description = 'Activate selected teams'
    
    def deactivate_teams(self, request, queryset):
        """Bulk action to deactivate teams"""
        count = queryset.update(status='inactive')
        self.message_user(request, f'{count} team(s) deactivated successfully.')
    deactivate_teams.short_description = 'Deactivate selected teams'


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    """Admin configuration for team members"""
    
    list_display = [
        'player_name',
        'team',
        'jersey_display',
        'role',
        'status_badge',
        'joined_date',
        'left_date',
    ]
    list_filter = ['status', 'role', 'team', 'joined_date']
    search_fields = [
        'player__user__first_name',
        'player__user__last_name',
        'player__user__email',
        'team__name',
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'joined_date'
    
    fieldsets = (
        ('Team Assignment', {
            'fields': ('team', 'player')
        }),
        ('Role and Status', {
            'fields': ('role', 'status', 'jersey_number')
        }),
        ('Dates', {
            'fields': ('joined_date', 'left_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def player_name(self, obj):
        """Display player full name"""
        return obj.player.user.get_full_name()
    player_name.short_description = 'Player'
    player_name.admin_order_field = 'player__user__last_name'
    
    def jersey_display(self, obj):
        """Display jersey number with team colors"""
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;">#{}</span>',
            obj.team.primary_color,
            obj.jersey_number
        )
    jersey_display.short_description = 'Jersey'
    jersey_display.admin_order_field = 'jersey_number'
    
    def status_badge(self, obj):
        """Display status with color"""
        colors = {
            'active': 'green',
            'injured': 'orange',
            'suspended': 'red',
            'left': 'gray',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">● {}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    actions = ['mark_as_active', 'mark_as_left']
    
    def mark_as_active(self, request, queryset):
        """Bulk action to mark as active"""
        count = queryset.update(status='active', left_date=None)
        self.message_user(request, f'{count} member(s) marked as active.')
    mark_as_active.short_description = 'Mark as active'
    
    def mark_as_left(self, request, queryset):
        """Bulk action to mark as left team"""
        from django.utils import timezone
        count = queryset.update(status='left', left_date=timezone.now().date())
        self.message_user(request, f'{count} member(s) marked as left team.')
    mark_as_left.short_description = 'Mark as left team'


@admin.register(TeamStats)
class TeamStatsAdmin(admin.ModelAdmin):
    """Admin configuration for team statistics"""
    
    list_display = [
        'team',
        'season',
        'record_display',
        'win_pct',
        'ppg',
        'streak_display',
        'league_rank',
    ]
    list_filter = ['season', 'team__division']
    search_fields = ['team__name', 'season']
    readonly_fields = [
        'created_at',
        'updated_at',
        'win_percentage',
        'points_per_game',
        'points_allowed_per_game',
        'point_differential',
    ]
    
    fieldsets = (
        ('Team and Season', {
            'fields': ('team', 'season')
        }),
        ('Game Statistics', {
            'fields': (
                'games_played',
                'wins',
                'losses',
                'win_percentage',
            )
        }),
        ('Points', {
            'fields': (
                'points_scored',
                'points_allowed',
                'points_per_game',
                'points_allowed_per_game',
                'point_differential',
            )
        }),
        ('Streaks', {
            'fields': (
                'current_streak',
                'longest_win_streak',
                'longest_loss_streak',
            )
        }),
        ('Rankings', {
            'fields': ('league_rank', 'division_rank')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def record_display(self, obj):
        """Display W-L record"""
        return format_html(
            '<span style="font-weight: bold;">{}-{}</span>',
            obj.wins,
            obj.losses
        )
    record_display.short_description = 'Record'
    record_display.admin_order_field = 'wins'
    
    def win_pct(self, obj):
        """Display win percentage"""
        return f"{obj.win_percentage}%"
    win_pct.short_description = 'Win %'
    win_pct.admin_order_field = 'wins'
    
    def ppg(self, obj):
        """Display points per game"""
        return f"{obj.points_per_game}"
    ppg.short_description = 'PPG'
    
    def streak_display(self, obj):
        """Display current streak with color"""
        streak = obj.current_streak
        if streak > 0:
            return format_html(
                '<span style="color: green; font-weight: bold;">W{}</span>',
                streak
            )
        elif streak < 0:
            return format_html(
                '<span style="color: red; font-weight: bold;">L{}</span>',
                abs(streak)
            )
        return '-'
    streak_display.short_description = 'Streak'
    streak_display.admin_order_field = 'current_streak'
