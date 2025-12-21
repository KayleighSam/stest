"""
Teams Serializers

Handles serialization for:
- Team creation and management
- Team roster management
- Team statistics
"""

from rest_framework import serializers
from django.utils.text import slugify
from apps.users.models import User, Player
from apps.users.serializers import UserSerializer, PlayerSerializer
from .models import Team, TeamMember, TeamStats


class TeamSerializer(serializers.ModelSerializer):
    """
    Team serializer with full details
    
    TBWS Use Case:
    - Display team information
    - Team profile pages
    - Team listings
    """
    
    head_coach_name = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()
    active_players_count = serializers.IntegerField(read_only=True)
    wins = serializers.IntegerField(read_only=True)
    losses = serializers.IntegerField(read_only=True)
    win_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'short_name',
            'slug',
            'founded_date',
            'division',
            'description',
            'logo',
            'primary_color',
            'secondary_color',
            'head_coach',
            'head_coach_name',
            'manager',
            'manager_name',
            'email',
            'phone',
            'home_venue',
            'status',
            'active_players_count',
            'wins',
            'losses',
            'win_percentage',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_head_coach_name(self, obj):
        """Get head coach full name"""
        if obj.head_coach:
            return obj.head_coach.get_full_name()
        return None
    
    def get_manager_name(self, obj):
        """Get manager full name"""
        if obj.manager:
            return obj.manager.get_full_name()
        return None
    
    def validate_name(self, value):
        """Validate team name is unique"""
        if self.instance:
            # Updating existing team
            if Team.objects.exclude(pk=self.instance.pk).filter(name__iexact=value).exists():
                raise serializers.ValidationError('A team with this name already exists.')
        else:
            # Creating new team
            if Team.objects.filter(name__iexact=value).exists():
                raise serializers.ValidationError('A team with this name already exists.')
        return value
    
    def create(self, validated_data):
        """Create team and auto-generate slug"""
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class TeamListSerializer(serializers.ModelSerializer):
    """
    Simplified team serializer for lists
    
    TBWS Use Case:
    - Team dropdown lists
    - Quick team info
    """
    
    active_players_count = serializers.IntegerField(read_only=True)
    wins = serializers.IntegerField(read_only=True)
    losses = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'short_name',
            'slug',
            'logo',
            'division',
            'status',
            'active_players_count',
            'wins',
            'losses',
        ]


class TeamCreateSerializer(serializers.ModelSerializer):
    """
    Team creation serializer
    
    TBWS Use Case:
    - Create new teams
    - Admin/manager team setup
    """
    
    class Meta:
        model = Team
        fields = [
            'name',
            'short_name',
            'founded_date',
            'division',
            'description',
            'logo',
            'primary_color',
            'secondary_color',
            'head_coach',
            'manager',
            'email',
            'phone',
            'home_venue',
        ]
    
    def validate_name(self, value):
        """Validate team name is unique"""
        if Team.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError('A team with this name already exists.')
        return value
    
    def create(self, validated_data):
        """Create team with auto-generated slug"""
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class TeamMemberSerializer(serializers.ModelSerializer):
    """
    Team member serializer with player details
    
    TBWS Use Case:
    - Display team rosters
    - Player assignments
    """
    
    player_details = PlayerSerializer(source='player', read_only=True)
    player_name = serializers.SerializerMethodField()
    team_name = serializers.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = TeamMember
        fields = [
            'id',
            'team',
            'team_name',
            'player',
            'player_details',
            'player_name',
            'role',
            'status',
            'jersey_number',
            'joined_date',
            'left_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_player_name(self, obj):
        """Get player full name"""
        return obj.player.user.get_full_name()
    
    def validate(self, attrs):
        """Validate team member data"""
        team = attrs.get('team')
        player = attrs.get('player')
        jersey_number = attrs.get('jersey_number')
        status = attrs.get('status', 'active')
        
        # Check if player is already on another active team
        if not self.instance:  # Only for creation
            existing_membership = TeamMember.objects.filter(
                player=player,
                status='active'
            ).exclude(team=team).first()
            
            if existing_membership:
                raise serializers.ValidationError({
                    'player': f'Player is already active on team: {existing_membership.team.name}'
                })
        
        # Check if jersey number is taken on this team
        if status == 'active':
            jersey_taken = TeamMember.objects.filter(
                team=team,
                jersey_number=jersey_number,
                status='active'
            )
            
            if self.instance:
                jersey_taken = jersey_taken.exclude(pk=self.instance.pk)
            
            if jersey_taken.exists():
                member = jersey_taken.first()
                raise serializers.ValidationError({
                    'jersey_number': f'Jersey #{jersey_number} is already taken by {member.player.user.get_full_name()}'
                })
        
        return attrs


class TeamMemberCreateSerializer(serializers.ModelSerializer):
    """
    Team member creation serializer
    
    TBWS Use Case:
    - Add players to team roster
    - Assign jersey numbers
    """
    
    class Meta:
        model = TeamMember
        fields = [
            'team',
            'player',
            'role',
            'status',
            'jersey_number',
            'joined_date',
        ]
    
    def validate(self, attrs):
        """Validate team member data"""
        team = attrs.get('team')
        player = attrs.get('player')
        jersey_number = attrs.get('jersey_number')
        
        # Check if player is already on this team
        if TeamMember.objects.filter(team=team, player=player, status='active').exists():
            raise serializers.ValidationError({
                'player': 'Player is already on this team'
            })
        
        # Check if jersey number is taken
        if TeamMember.objects.filter(
            team=team,
            jersey_number=jersey_number,
            status='active'
        ).exists():
            raise serializers.ValidationError({
                'jersey_number': f'Jersey #{jersey_number} is already taken on this team'
            })
        
        return attrs


class TeamStatsSerializer(serializers.ModelSerializer):
    """
    Team statistics serializer
    
    TBWS Use Case:
    - Display team performance
    - Season records
    - League standings
    """
    
    team_name = serializers.CharField(source='team.name', read_only=True)
    win_percentage = serializers.FloatField(read_only=True)
    points_per_game = serializers.FloatField(read_only=True)
    points_allowed_per_game = serializers.FloatField(read_only=True)
    point_differential = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TeamStats
        fields = [
            'id',
            'team',
            'team_name',
            'season',
            'games_played',
            'wins',
            'losses',
            'win_percentage',
            'points_scored',
            'points_allowed',
            'points_per_game',
            'points_allowed_per_game',
            'point_differential',
            'current_streak',
            'longest_win_streak',
            'longest_loss_streak',
            'league_rank',
            'division_rank',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate stats data"""
        games_played = attrs.get('games_played', 0)
        wins = attrs.get('wins', 0)
        losses = attrs.get('losses', 0)
        
        # Validate games_played equals wins + losses
        if games_played != (wins + losses):
            raise serializers.ValidationError({
                'games_played': 'Games played must equal wins + losses'
            })
        
        return attrs


class TeamStatsCreateSerializer(serializers.ModelSerializer):
    """
    Team statistics creation serializer
    
    TBWS Use Case:
    - Initialize season stats
    - Track team records
    """
    
    class Meta:
        model = TeamStats
        fields = [
            'team',
            'season',
            'games_played',
            'wins',
            'losses',
            'points_scored',
            'points_allowed',
            'current_streak',
            'longest_win_streak',
            'longest_loss_streak',
            'league_rank',
            'division_rank',
        ]
    
    def validate(self, attrs):
        """Validate stats data"""
        team = attrs.get('team')
        season = attrs.get('season')
        
        # Check if stats already exist for this team and season
        if TeamStats.objects.filter(team=team, season=season).exists():
            raise serializers.ValidationError({
                'season': f'Statistics already exist for {team.name} in season {season}'
            })
        
        games_played = attrs.get('games_played', 0)
        wins = attrs.get('wins', 0)
        losses = attrs.get('losses', 0)
        
        # Validate games_played equals wins + losses
        if games_played != (wins + losses):
            raise serializers.ValidationError({
                'games_played': 'Games played must equal wins + losses'
            })
        
        return attrs


class TeamRosterSerializer(serializers.ModelSerializer):
    """
    Complete team roster serializer
    
    TBWS Use Case:
    - Display full team roster with all players
    - Team page roster section
    """
    
    members = TeamMemberSerializer(many=True, read_only=True)
    active_players = serializers.SerializerMethodField()
    captains = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'short_name',
            'logo',
            'division',
            'members',
            'active_players',
            'captains',
        ]
    
    def get_active_players(self, obj):
        """Get only active players"""
        members = obj.members.filter(status='active', role='player')
        return TeamMemberSerializer(members, many=True).data
    
    def get_captains(self, obj):
        """Get team captains"""
        members = obj.members.filter(
            status='active',
            role__in=['captain', 'vice_captain']
        )
        return TeamMemberSerializer(members, many=True).data
