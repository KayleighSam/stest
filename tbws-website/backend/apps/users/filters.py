from django_filters import rest_framework as filters
from .models import Player, User


class PlayerFilter(filters.FilterSet):
    """
    Custom filter for Player model
    Allows filtering by multiple fields with various operators
    """
    
    # Text search filters
    name = filters.CharFilter(method='filter_by_name', label='Player name')
    position = filters.ChoiceFilter(choices=Player.POSITION_CHOICES)
    status = filters.ChoiceFilter(choices=Player.STATUS_CHOICES)
    
    # Number range filters
    jersey_min = filters.NumberFilter(field_name='jersey_number', lookup_expr='gte')
    jersey_max = filters.NumberFilter(field_name='jersey_number', lookup_expr='lte')
    jersey_number = filters.NumberFilter()
    
    # Location filter
    hometown = filters.CharFilter(lookup_expr='icontains')
    
    # Date filters
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # User-related filters
    email = filters.CharFilter(field_name='user__email', lookup_expr='icontains')
    is_active = filters.BooleanFilter(field_name='user__is_active')
    
    class Meta:
        model = Player
        fields = [
            'position', 'status', 'jersey_number', 
            'hometown', 'is_active'
        ]
    
    def filter_by_name(self, queryset, name, value):
        """
        Custom filter method to search by first name or last name
        """
        return queryset.filter(
            user__first_name__icontains=value
        ) | queryset.filter(
            user__last_name__icontains=value
        )


class UserFilter(filters.FilterSet):
    """
    Custom filter for User model
    """
    
    # Text search
    name = filters.CharFilter(method='filter_by_name', label='User name')
    email = filters.CharFilter(lookup_expr='icontains')
    username = filters.CharFilter(lookup_expr='icontains')
    
    # Choice filters
    role = filters.ChoiceFilter(choices=User.ROLE_CHOICES)
    status = filters.ChoiceFilter(choices=User.STATUS_CHOICES)
    
    # Boolean filters
    is_active = filters.BooleanFilter()
    is_staff = filters.BooleanFilter()
    email_verified = filters.BooleanFilter()
    
    # Date filters
    joined_after = filters.DateTimeFilter(field_name='date_joined', lookup_expr='gte')
    joined_before = filters.DateTimeFilter(field_name='date_joined', lookup_expr='lte')
    
    class Meta:
        model = User
        fields = [
            'role', 'status', 'is_active', 'is_staff', 
            'email_verified', 'email', 'username'
        ]
    
    def filter_by_name(self, queryset, name, value):
        """
        Custom filter method to search by first name or last name
        """
        return queryset.filter(
            first_name__icontains=value
        ) | queryset.filter(
            last_name__icontains=value
        )