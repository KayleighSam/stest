"""
Authentication Tests

Test coverage:
- User login
- JWT token generation
- Password reset flow
- Email verification
- Password change
- Token refresh
- Logout
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.users.models import User
from .models import PasswordResetToken, EmailVerificationToken, LoginHistory


class AuthenticationAPITest(APITestCase):
    """Test authentication API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@tbws.com',
            username='testuser',
            first_name='Test',
            last_name='User',
            password='TestPass123!',
            email_verified=True
        )
    
    def test_login_success(self):
        """Test successful login"""
        url = '/api/auth/login/'
        data = {
            'email': 'test@tbws.com',
            'password': 'TestPass123!'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'test@tbws.com')
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        url = '/api/auth/login/'
        data = {
            'email': 'test@tbws.com',
            'password': 'WrongPassword'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_inactive_user(self):
        """Test login with inactive user"""
        # Make user inactive
        self.user.is_active = False
        self.user.save()
        
        url = '/api/auth/login/'
        data = {
            'email': 'test@tbws.com',
            'password': 'TestPass123!'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('inactive', response.data['detail'].lower())
    
    def test_password_reset_request(self):
        """Test password reset request"""
        url = '/api/auth/password-reset/'
        data = {'email': 'test@tbws.com'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check token was created
        self.assertTrue(
            PasswordResetToken.objects.filter(user=self.user).exists()
        )
    
    def test_password_reset_confirm(self):
        """Test password reset confirmation"""
        # Create reset token
        reset_token = PasswordResetToken.objects.create(user=self.user)
        
        url = '/api/auth/password-reset/confirm/'
        data = {
            'token': str(reset_token.token),
            'password': 'NewPass123!',
            'password_confirm': 'NewPass123!'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify password changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))
        
        # Verify token marked as used
        reset_token.refresh_from_db()
        self.assertTrue(reset_token.is_used)
    
    def test_password_change(self):
        """Test password change for authenticated user"""
        # Login first
        self.client.force_authenticate(user=self.user)
        
        url = '/api/auth/password-change/'
        data = {
            'old_password': 'TestPass123!',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'NewPass456!'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify password changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass456!'))
    
    def test_email_verification(self):
        """Test email verification"""
        # Create unverified user
        unverified_user = User.objects.create_user(
            email='unverified@tbws.com',
            username='unverified',
            password='TestPass123!',
            email_verified=False
        )
        
        # Create verification token
        token = EmailVerificationToken.objects.create(user=unverified_user)
        
        url = '/api/auth/email-verify/'
        data = {'token': str(token.token)}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify email marked as verified
        unverified_user.refresh_from_db()
        self.assertTrue(unverified_user.email_verified)
        
        # Verify token marked as verified
        token.refresh_from_db()
        self.assertTrue(token.is_verified)
    
    def test_get_current_user(self):
        """Test getting current authenticated user"""
        # Login first
        self.client.force_authenticate(user=self.user)
        
        url = '/api/auth/me/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@tbws.com')
    
    def test_token_refresh(self):
        """Test JWT token refresh"""
        # Login to get tokens
        login_url = '/api/auth/login/'
        login_data = {
            'email': 'test@tbws.com',
            'password': 'TestPass123!'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']
        
        # Refresh token
        refresh_url = '/api/auth/token/refresh/'
        refresh_data = {'refresh': refresh_token}
        response = self.client.post(refresh_url, refresh_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_login_history_created(self):
        """Test that login history is created on login"""
        url = '/api/auth/login/'
        data = {
            'email': 'test@tbws.com',
            'password': 'TestPass123!'
        }
        
        # Check no history exists
        self.assertEqual(LoginHistory.objects.filter(user=self.user).count(), 0)
        
        # Login
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check history created
        self.assertEqual(LoginHistory.objects.filter(user=self.user).count(), 1)
        
        history = LoginHistory.objects.filter(user=self.user).first()
        self.assertTrue(history.success)
    
    def test_logout(self):
        """Test logout (token blacklisting)"""
        # Login to get tokens
        login_url = '/api/auth/login/'
        login_data = {
            'email': 'test@tbws.com',
            'password': 'TestPass123!'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']
        
        # Authenticate
        self.client.force_authenticate(user=self.user)
        
        # Logout
        logout_url = '/api/auth/logout/'
        logout_data = {'refresh': refresh_token}
        response = self.client.post(logout_url, logout_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PasswordResetTokenTest(TestCase):
    """Test PasswordResetToken model"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            email='test@tbws.com',
            username='testuser',
            password='TestPass123!'
        )
    
    def test_token_creation(self):
        """Test creating password reset token"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertIsNotNone(token.token)
        self.assertIsNotNone(token.expires_at)
        self.assertFalse(token.is_used)
    
    def test_token_validity(self):
        """Test token validity check"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertTrue(token.is_valid)
        
        # Mark as used
        token.mark_as_used()
        self.assertFalse(token.is_valid)


class EmailVerificationTokenTest(TestCase):
    """Test EmailVerificationToken model"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            email='test@tbws.com',
            username='testuser',
            password='TestPass123!',
            email_verified=False
        )
    
    def test_token_creation(self):
        """Test creating email verification token"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertIsNotNone(token.token)
        self.assertIsNotNone(token.expires_at)
        self.assertFalse(token.is_verified)
    
    def test_mark_as_verified(self):
        """Test marking token as verified"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        token.mark_as_verified()
        
        self.assertTrue(token.is_verified)
        
        # Check user email_verified updated
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)
