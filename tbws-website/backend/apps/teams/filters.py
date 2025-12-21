"""
Teams Filters

Provides filtering capabilities for:
- Teams by status, division
- Team members by status, role
- Team stats by season
"""

import django_filters
from .models import Team, TeamMember, TeamStats


class TeamFilter(django_filters.FilterSet):
    """
    Filter teams
    
    TBWS Use Case:
    - Filter teams by status (active, inactive)
    - Filter by division (men, women, youth)
    - Search by name
    """
    
    status = django_filters.ChoiceFilter(
        choices=Team.STATUS_CHOICES,
        help_text='Filter by team status'
    )
    division = django_filters.ChoiceFilter(
        choices=Team.DIVISION_CHOICES,
        help_text='Filter by division'
    )
    founded_year = django_filters.NumberFilter(
        field_name='founded_date',
        lookup_expr='year',
        help_text='Filter by founding year'
    )
    
    class Meta:
        model = Team
        fields = {
            'status': ['exact'],
            'division': ['exact'],
            'founded_date': ['year', 'gte', 'lte'],
        }


class TeamMemberFilter(django_filters.FilterSet):
    """
    Filter team members
    
    TBWS Use Case:
    - Filter by team
    - Filter by status (active, left, injured)
    - Filter by role (player, captain)
    """
    
    team = django_filters.NumberFilter(
        field_name='team__id',
        help_text='Filter by team ID'
    )
    team_name = django_filters.CharFilter(
        field_name='team__name',
        lookup_expr='icontains',
        help_text='Filter by team name'
    )
    status = django_filters.ChoiceFilter(
        choices=TeamMember.STATUS_CHOICES,
        help_text='Filter by membership status'
    )
    role = django_filters.ChoiceFilter(
        choices=TeamMember.ROLE_CHOICES,
        help_text='Filter by player role'
    )
    jersey_number = django_filters.NumberFilter(
        help_text='Filter by jersey number'
    )
    jersey_min = django_filters.NumberFilter(
        field_name='jersey_number',
        lookup_expr='gte',
        help_text='Minimum jersey number'
    )
    jersey_max = django_filters.NumberFilter(
        field_name='jersey_number',
        lookup_expr='lte',
        help_text='Maximum jersey number'
    )
    
    class Meta:
        model = TeamMember
        fields = {
            'team': ['exact'],
            'status': ['exact'],
            'role': ['exact'],
            'jersey_number': ['exact', 'gte', 'lte'],
            'joined_date': ['year', 'gte', 'lte'],
        }


class TeamStatsFilter(django_filters.FilterSet):
    """
    Filter team statistics
    
    TBWS Use Case:
    - Filter by season
    - Filter by team
    - Filter by performance metrics
    """
    
    team = django_filters.NumberFilter(
        field_name='team__id',
        help_text='Filter by team ID'
    )
    team_name = django_filters.CharFilter(
        field_name='team__name',
        lookup_expr='icontains',
        help_text='Filter by team name'
    )
    season = django_filters.CharFilter(
        lookup_expr='exact',
        help_text='Filter by season (e.g., "2024")'
    )
    min_wins = django_filters.NumberFilter(
        field_name='wins',
        lookup_expr='gte',
        help_text='Minimum wins'
    )
    min_win_percentage = django_filters.NumberFilter(
        method='filter_win_percentage',
        help_text='Minimum win percentage (0-100)'
    )
    
    class Meta:
        model = TeamStats
        fields = {
            'team': ['exact'],
            'season': ['exact'],
            'wins': ['exact', 'gte', 'lte'],
            'losses': ['exact', 'gte', 'lte'],
            'games_played': ['exact', 'gte', 'lte'],
        }
    
    def filter_win_percentage(self, queryset, name, value):
        """Filter by win percentage"""
        filtered_ids = []
        for stats in queryset:
            if stats.win_percentage >= value:
                filtered_ids.append(stats.id)
        return queryset.filter(id__in=filtered_ids)
