from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Player

User = get_user_model()


class UserModelTest(TestCase):
    """Test cases for User model"""
    
    def setUp(self):
        """Set up test data"""
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'testpass123'
        }
    
    def test_create_user(self):
        """Test creating a user"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.role, 'player')
        self.assertTrue(user.is_active)
    
    def test_user_string_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(**self.user_data)
        expected = f"{user.get_full_name()} ({user.email})"
        self.assertEqual(str(user), expected)
    
    def test_user_properties(self):
        """Test user role properties"""
        user = User.objects.create_user(**self.user_data)
        
        # Player role
        self.assertTrue(user.is_player)
        self.assertFalse(user.is_manager)
        self.assertFalse(user.is_admin)
        
        # Manager role
        user.role = 'manager'
        user.save()
        self.assertFalse(user.is_player)
        self.assertTrue(user.is_manager)
        self.assertFalse(user.is_admin)
        
        # Admin role
        user.role = 'admin'
        user.save()
        self.assertFalse(user.is_player)
        self.assertTrue(user.is_manager)
        self.assertTrue(user.is_admin)
    
    def test_email_unique(self):
        """Test that email must be unique"""
        User.objects.create_user(**self.user_data)
        
        # Try to create another user with same email
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='test@example.com',
                username='anotheruser',
                password='pass123'
            )


class PlayerModelTest(TestCase):
    """Test cases for Player model"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            email='player@example.com',
            username='player1',
            first_name='Jane',
            last_name='Smith',
            password='pass123'
        )
        
        self.player_data = {
            'user': self.user,
            'jersey_number': 23,
            'position': 'PG',
            'height': '6\'2"',
            'weight': '180 lbs',
            'hometown': 'New York',
        }
    
    def test_create_player(self):
        """Test creating a player"""
        player = Player.objects.create(**self.player_data)
        self.assertEqual(player.user, self.user)
        self.assertEqual(player.jersey_number, 23)
        self.assertEqual(player.position, 'PG')
        self.assertEqual(player.status, 'active')
    
    def test_player_string_representation(self):
        """Test player string representation"""
        player = Player.objects.create(**self.player_data)
        expected = f"{player.user.get_full_name()} - #23"
        self.assertEqual(str(player), expected)
    
    def test_player_properties(self):
        """Test player properties"""
        player = Player.objects.create(**self.player_data)
        self.assertEqual(player.full_name, 'Jane Smith')
        self.assertEqual(player.display_name, '#23 Jane Smith')
    
    def test_player_save_updates_user_role(self):
        """Test that saving player updates user role"""
        self.user.role = 'admin'
        self.user.save()
        
        player = Player.objects.create(**self.player_data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, 'player')


class UserAPITest(APITestCase):
    """Test cases for User API endpoints"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        
        # Create test users
        self.user = User.objects.create_user(
            email='user@example.com',
            username='testuser',
            first_name='John',
            last_name='Doe',
            password='testpass123'
        )
        
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            first_name='Admin',
            last_name='User',
            password='adminpass123',
            role='admin',
            is_staff=True
        )
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123!',
            'password_confirm': 'newpass123!'
        }
        
        response = self.client.post('/api/users/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
    
    def test_user_registration_password_mismatch(self):
        """Test registration with password mismatch"""
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123!',
            'password_confirm': 'differentpass123!'
        }
        
        response = self.client.post('/api/users/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_current_user(self):
        """Test getting current authenticated user"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/me/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)
    
    def test_update_current_user(self):
        """Test updating current user"""
        self.client.force_authenticate(user=self.user)
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        response = self.client.put('/api/users/update_me/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
    
    def test_change_password(self):
        """Test password change endpoint"""
        self.client.force_authenticate(user=self.user)
        data = {
            'old_password': 'testpass123',
            'new_password': 'newtestpass123!',
            'new_password_confirm': 'newtestpass123!'
        }
        
        response = self.client.post('/api/users/change_password/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newtestpass123!'))
    
    def test_list_users_requires_admin(self):
        """Test that listing users requires admin privileges"""
        # Regular user
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Admin user
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PlayerAPITest(APITestCase):
    """Test cases for Player API endpoints"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            email='player@example.com',
            username='player1',
            first_name='Jane',
            last_name='Smith',
            password='pass123'
        )
        
        # Create test player
        self.player = Player.objects.create(
            user=self.user,
            jersey_number=23,
            position='PG',
            height='6\'2"',
            weight='180 lbs',
            hometown='New York'
        )
        
        # Create admin user
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='adminpass',
            role='admin',
            is_staff=True
        )
    
    def test_list_players_public(self):
        """Test that anyone can list players"""
        response = self.client.get('/api/players/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_player_detail_public(self):
        """Test that anyone can view player details"""
        response = self.client.get(f'/api/players/{self.player.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['jersey_number'], 23)
    
    def test_create_player_authenticated(self):
        """Test creating player profile requires authentication"""
        # Unauthenticated
        data = {
            'jersey_number': 10,
            'position': 'SG'
        }
        response = self.client.post('/api/players/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Authenticated - create new user without player profile
        new_user = User.objects.create_user(
            email='new@example.com',
            username='newplayer',
            password='pass123'
        )
        self.client.force_authenticate(user=new_user)
        
        response = self.client.post('/api/players/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_get_my_profile(self):
        """Test getting current user's player profile"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/players/my_profile/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['jersey_number'], 23)
    
    def test_filter_players_by_position(self):
        """Test filtering players by position"""
        # Create another player
        user2 = User.objects.create_user(
            email='player2@example.com',
            username='player2',
            password='pass123'
        )
        Player.objects.create(
            user=user2,
            jersey_number=10,
            position='SG'
        )
        
        response = self.client.get('/api/players/?position=PG')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_search_players(self):
        """Test searching players"""
        response = self.client.get('/api/players/?search=Jane')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
    
    def test_get_active_players(self):
        """Test getting active players"""
        response = self.client.get('/api/players/active/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_player_owner(self):
        """Test that player can update own profile"""
        self.client.force_authenticate(user=self.user)
        data = {
            'jersey_number': 24,
            'bio': 'Updated bio'
        }
        
        response = self.client.patch(f'/api/players/{self.player.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.player.refresh_from_db()
        self.assertEqual(self.player.jersey_number, 24)