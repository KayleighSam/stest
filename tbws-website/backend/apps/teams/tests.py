"""
Teams Tests

Test coverage:
- Team creation and management
- Team roster operations
- Team statistics
- Permissions and access control
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.users.models import User, Player
from .models import Team, TeamMember, TeamStats


class TeamModelTest(TestCase):
    """Test Team model"""
    
    def setUp(self):
        """Set up test data"""
        self.team = Team.objects.create(
            name='Test Warriors',
            short_name='Warriors',
            slug='test-warriors',
            division='men',
            status='active'
        )
    
    def test_team_creation(self):
        """Test creating a team"""
        self.assertEqual(self.team.name, 'Test Warriors')
        self.assertEqual(self.team.slug, 'test-warriors')
        self.assertEqual(self.team.status, 'active')
    
    def test_team_string_representation(self):
        """Test team __str__ method"""
        self.assertEqual(str(self.team), 'Test Warriors')
    
    def test_active_players_count(self):
        """Test active players count"""
        # Create user and player
        user = User.objects.create_user(
            email='player@test.com',
            username='player1',
            password='Test123!'
        )
        player = Player.objects.create(
            user=user,
            position='PG',
            jersey_number=23
        )
        
        # Add to team
        TeamMember.objects.create(
            team=self.team,
            player=player,
            jersey_number=10,
            status='active'
        )
        
        self.assertEqual(self.team.active_players_count, 1)


class TeamMemberModelTest(TestCase):
    """Test TeamMember model"""
    
    def setUp(self):
        """Set up test data"""
        self.team = Team.objects.create(
            name='Test Team',
            slug='test-team',
            division='men'
        )
        
        self.user = User.objects.create_user(
            email='player@test.com',
            username='player1',
            password='Test123!'
        )
        
        self.player = Player.objects.create(
            user=self.user,
            position='PG',
            jersey_number=23
        )
        
        self.member = TeamMember.objects.create(
            team=self.team,
            player=self.player,
            jersey_number=10,
            role='player',
            status='active'
        )
    
    def test_team_member_creation(self):
        """Test creating team member"""
        self.assertEqual(self.member.team, self.team)
        self.assertEqual(self.member.player, self.player)
        self.assertEqual(self.member.jersey_number, 10)
    
    def test_team_member_is_active(self):
        """Test is_active property"""
        self.assertTrue(self.member.is_active)
        
        self.member.status = 'left'
        self.member.save()
        self.assertFalse(self.member.is_active)


class TeamStatsModelTest(TestCase):
    """Test TeamStats model"""
    
    def setUp(self):
        """Set up test data"""
        self.team = Team.objects.create(
            name='Test Team',
            slug='test-team',
            division='men'
        )
        
        self.stats = TeamStats.objects.create(
            team=self.team,
            season='2024',
            games_played=10,
            wins=7,
            losses=3,
            points_scored=850,
            points_allowed=780
        )
    
    def test_stats_creation(self):
        """Test creating team stats"""
        self.assertEqual(self.stats.team, self.team)
        self.assertEqual(self.stats.season, '2024')
        self.assertEqual(self.stats.wins, 7)
        self.assertEqual(self.stats.losses, 3)
    
    def test_win_percentage(self):
        """Test win percentage calculation"""
        self.assertEqual(self.stats.win_percentage, 70.0)
    
    def test_points_per_game(self):
        """Test points per game calculation"""
        self.assertEqual(self.stats.points_per_game, 85.0)
    
    def test_point_differential(self):
        """Test point differential calculation"""
        self.assertEqual(self.stats.point_differential, 70)


class TeamAPITest(APITestCase):
    """Test Team API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create admin user
        self.admin = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='Admin123!',
            role='super_admin',
            is_staff=True
        )
        
        # Create regular user
        self.user = User.objects.create_user(
            email='user@test.com',
            username='user',
            password='User123!'
        )
        
        # Create team
        self.team = Team.objects.create(
            name='Test Warriors',
            short_name='Warriors',
            slug='test-warriors',
            division='men',
            status='active'
        )
    
    def test_list_teams_public(self):
        """Test listing teams (public access)"""
        url = '/api/teams/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_team_admin_only(self):
        """Test creating team (admin only)"""
        url = '/api/teams/'
        data = {
            'name': 'New Team',
            'short_name': 'New',
            'division': 'women'
        }
        
        # Unauthenticated should fail
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Regular user should fail
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Admin should succeed
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Team.objects.count(), 2)
    
    def test_get_team_roster(self):
        """Test getting team roster"""
        # Create player
        user = User.objects.create_user(
            email='player@test.com',
            username='player1',
            password='Test123!'
        )
        player = Player.objects.create(
            user=user,
            position='PG',
            jersey_number=23
        )
        
        # Add to team
        TeamMember.objects.create(
            team=self.team,
            player=player,
            jersey_number=10,
            status='active'
        )
        
        url = f'/api/teams/{self.team.id}/roster/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['members']), 1)
    
    def test_get_standings(self):
        """Test getting league standings"""
        # Create stats
        TeamStats.objects.create(
            team=self.team,
            season='2024',
            games_played=10,
            wins=7,
            losses=3
        )
        
        url = '/api/teams/standings/?season=2024'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['standings']), 1)
    
    def test_filter_by_division(self):
        """Test filtering teams by division"""
        # Create another team in different division
        Team.objects.create(
            name='Women Warriors',
            slug='women-warriors',
            division='women',
            status='active'
        )
        
        url = '/api/teams/by-division/?division=men'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


class TeamMemberAPITest(APITestCase):
    """Test TeamMember API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create admin
        self.admin = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='Admin123!',
            role='super_admin'
        )
        
        # Create team
        self.team = Team.objects.create(
            name='Test Team',
            slug='test-team',
            division='men'
        )
        
        # Create player
        user = User.objects.create_user(
            email='player@test.com',
            username='player1',
            password='Test123!'
        )
        self.player = Player.objects.create(
            user=user,
            position='PG',
            jersey_number=23
        )
    
    def test_add_player_to_team(self):
        """Test adding player to team"""
        self.client.force_authenticate(user=self.admin)
        
        url = f'/api/teams/{self.team.id}/add-player/'
        data = {
            'player': self.player.id,
            'jersey_number': 10,
            'role': 'player'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TeamMember.objects.count(), 1)
    
    def test_duplicate_jersey_validation(self):
        """Test jersey number uniqueness"""
        self.client.force_authenticate(user=self.admin)
        
        # Add first player
        TeamMember.objects.create(
            team=self.team,
            player=self.player,
            jersey_number=10,
            status='active'
        )
        
        # Try to add another player with same jersey
        user2 = User.objects.create_user(
            email='player2@test.com',
            username='player2',
            password='Test123!'
        )
        player2 = Player.objects.create(
            user=user2,
            position='SG',
            jersey_number=15
        )
        
        url = f'/api/teams/{self.team.id}/add-player/'
        data = {
            'player': player2.id,
            'jersey_number': 10,  # Same jersey
            'role': 'player'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
