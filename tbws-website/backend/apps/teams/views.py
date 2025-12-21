"""
Teams Views

API Endpoints:
- GET/POST /api/teams/ - List/Create teams
- GET/PUT/PATCH/DELETE /api/teams/{id}/ - Team detail/update/delete
- GET /api/teams/{id}/roster/ - Get team roster
- POST /api/teams/{id}/add-player/ - Add player to team
- POST /api/teams/{id}/remove-player/ - Remove player from team
- GET /api/teams/{id}/stats/ - Get team statistics
- POST /api/teams/{id}/stats/ - Create team statistics
- GET /api/teams/by-division/{division}/ - Teams by division
- GET /api/teams/standings/ - League standings

- GET/POST /api/team-members/ - List/Create team members
- GET/PUT/PATCH/DELETE /api/team-members/{id}/ - Member detail/update/delete

- GET/POST /api/team-stats/ - List/Create team stats
- GET/PUT/PATCH/DELETE /api/team-stats/{id}/ - Stats detail/update/delete
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Team, TeamMember, TeamStats
from .serializers import (
    TeamSerializer,
    TeamListSerializer,
    TeamCreateSerializer,
    TeamMemberSerializer,
    TeamMemberCreateSerializer,
    TeamStatsSerializer,
    TeamStatsCreateSerializer,
    TeamRosterSerializer,
)
from .filters import TeamFilter, TeamMemberFilter, TeamStatsFilter


class TeamViewSet(viewsets.ModelViewSet):
    """
    Team management endpoints
    
    TBWS Use Cases:
    - List all teams (public)
    - Create new team (admin only)
    - View team details (public)
    - Update team info (manager/admin)
    - Delete team (admin only)
    - Get team roster
    - Add/remove players
    """
    
    queryset = Team.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TeamFilter
    search_fields = ['name', 'short_name', 'description']
    ordering_fields = ['name', 'created_at', 'founded_date']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return TeamListSerializer
        elif self.action == 'create':
            return TeamCreateSerializer
        elif self.action == 'roster':
            return TeamRosterSerializer
        return TeamSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve', 'roster', 'by_division', 'standings']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            # Update and other actions require authentication
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def roster(self, request, pk=None):
        """
        Get team roster with all players
        
        GET /api/teams/{id}/roster/
        
        TBWS Use Case:
        - Display team roster on team page
        - Show all players, captains, and staff
        """
        team = self.get_object()
        serializer = TeamRosterSerializer(team)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_player(self, request, pk=None):
        """
        Add player to team roster
        
        POST /api/teams/{id}/add-player/
        Body: {
            "player": <player_id>,
            "jersey_number": 23,
            "role": "player"
        }
        
        TBWS Use Case:
        - Manager adds player to team
        - Assign jersey number
        """
        team = self.get_object()
        
        # Create team member
        data = request.data.copy()
        data['team'] = team.id
        
        serializer = TeamMemberCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Player added to team successfully',
            'member': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def remove_player(self, request, pk=None):
        """
        Remove player from team roster
        
        POST /api/teams/{id}/remove-player/
        Body: {
            "player": <player_id>
        }
        
        TBWS Use Case:
        - Manager removes player from team
        - Player leaves team
        """
        team = self.get_object()
        player_id = request.data.get('player')
        
        if not player_id:
            return Response({
                'error': 'Player ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            member = TeamMember.objects.get(team=team, player_id=player_id, status='active')
            member.status = 'left'
            member.left_date = timezone.now().date()
            member.save()
            
            return Response({
                'message': 'Player removed from team successfully'
            })
        except TeamMember.DoesNotExist:
            return Response({
                'error': 'Player is not on this team'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get', 'post'])
    def stats(self, request, pk=None):
        """
        Get or create team statistics
        
        GET /api/teams/{id}/stats/ - Get all seasons
        POST /api/teams/{id}/stats/ - Create stats for season
        
        TBWS Use Case:
        - View team performance history
        - Track season records
        """
        team = self.get_object()
        
        if request.method == 'GET':
            # Get all stats for this team
            stats = TeamStats.objects.filter(team=team)
            serializer = TeamStatsSerializer(stats, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create new stats entry
            data = request.data.copy()
            data['team'] = team.id
            
            serializer = TeamStatsCreateSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response({
                'message': 'Team statistics created successfully',
                'stats': serializer.data
            }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def by_division(self, request):
        """
        Get teams by division
        
        GET /api/teams/by-division/?division=men
        
        TBWS Use Case:
        - Filter teams by division (men, women, youth)
        - Division-specific team listings
        """
        division = request.query_params.get('division')
        
        if not division:
            return Response({
                'error': 'Division parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        teams = Team.objects.filter(division=division, status='active')
        serializer = TeamListSerializer(teams, many=True)
        
        return Response({
            'division': division,
            'count': teams.count(),
            'teams': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def standings(self, request):
        """
        Get league standings
        
        GET /api/teams/standings/?season=2024
        
        TBWS Use Case:
        - Display league standings
        - Show team rankings
        """
        season = request.query_params.get('season')
        division = request.query_params.get('division')
        
        if not season:
            return Response({
                'error': 'Season parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get stats for season
        stats = TeamStats.objects.filter(season=season)
        
        if division:
            stats = stats.filter(team__division=division)
        
        stats = stats.order_by('-wins', 'losses')
        serializer = TeamStatsSerializer(stats, many=True)
        
        return Response({
            'season': season,
            'division': division or 'all',
            'standings': serializer.data
        })


class TeamMemberViewSet(viewsets.ModelViewSet):
    """
    Team member management endpoints
    
    TBWS Use Cases:
    - List all team members
    - Create team member (add player to team)
    - Update member info (jersey, role)
    - Remove member from team
    """
    
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = TeamMemberFilter
    ordering_fields = ['jersey_number', 'joined_date']
    ordering = ['team__name', 'jersey_number']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return TeamMemberCreateSerializer
        return TeamMemberSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


class TeamStatsViewSet(viewsets.ModelViewSet):
    """
    Team statistics management endpoints
    
    TBWS Use Cases:
    - List all team stats
    - Create season stats
    - Update stats (wins, losses, etc.)
    - View historical performance
    """
    
    queryset = TeamStats.objects.all()
    serializer_class = TeamStatsSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = TeamStatsFilter
    ordering_fields = ['season', 'wins', 'win_percentage']
    ordering = ['-season', '-wins']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return TeamStatsCreateSerializer
        return TeamStatsSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]