"""
Authentication Serializers

Handles serialization for:
- Login (JWT token generation)
- Password reset request and confirmation
- Email verification
- Password change
- Token refresh
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from apps.users.models import User
from apps.users.serializers import UserSerializer
from .models import PasswordResetToken, EmailVerificationToken


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer
    
    Extends default to include:
    - User information in response
    - Custom claims in token
    - Login history tracking
    """
    
    def validate(self, attrs):
        """Validate and return token with user data"""
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = UserSerializer(self.user).data
        
        # Add custom claims
        data['user_id'] = self.user.id
        data['email'] = self.user.email
        data['role'] = self.user.role
        
        return data
    
    @classmethod
    def get_token(cls, user):
        """Add custom claims to token"""
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['is_admin'] = user.is_admin
        
        return token


class LoginSerializer(serializers.Serializer):
    """
    Login serializer using email and password
    
    TBWS Use Case:
    - Players login with email/password
    - Returns JWT tokens for API access
    - Tracks login attempts
    """
    email = serializers.EmailField(
        required=True,
        help_text='User email address'
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='User password'
    )
    
    def validate(self, attrs):
        """Validate email and password"""
        email = attrs.get('email', '').lower()
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError({
                'detail': 'Email and password are required.'
            })
        
        # Try to get user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'detail': 'Invalid email or password.'
            })
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'This account is inactive.'
            })
        
        # Check if user is suspended
        if user.status == 'suspended':
            raise serializers.ValidationError({
                'detail': 'This account has been suspended. Please contact support.'
            })
        
        # Authenticate user
        user = authenticate(
            request=self.context.get('request'),
            username=email,  # AUTH_USER_MODEL uses email as USERNAME_FIELD
            password=password
        )
        
        if not user:
            raise serializers.ValidationError({
                'detail': 'Invalid email or password.'
            })
        
        attrs['user'] = user
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Request password reset email
    
    TBWS Use Case:
    - Player forgot password
    - Send reset link via email
    """
    email = serializers.EmailField(
        required=True,
        help_text='Email address to send reset link'
    )
    
    def validate_email(self, value):
        """Validate email exists"""
        email = value.lower()
        try:
            User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists (security)
            # Just return success anyway
            pass
        return email


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Confirm password reset with token
    
    TBWS Use Case:
    - Player clicks reset link
    - Enters new password
    - Token validates and password updates
    """
    token = serializers.UUIDField(
        required=True,
        help_text='Password reset token from email'
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='New password'
    )
    password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='Confirm new password'
    )
    
    def validate(self, attrs):
        """Validate passwords match and token is valid"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password': 'Passwords do not match.'
            })
        
        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({
                'password': list(e.messages)
            })
        
        # Validate token
        try:
            token_obj = PasswordResetToken.objects.get(token=attrs['token'])
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({
                'token': 'Invalid or expired token.'
            })
        
        if not token_obj.is_valid:
            raise serializers.ValidationError({
                'token': 'This token has expired or been used.'
            })
        
        attrs['token_obj'] = token_obj
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """
    Verify email with token
    
    TBWS Use Case:
    - New player clicks verification link in email
    - Email gets verified
    - Account becomes fully active
    """
    token = serializers.UUIDField(
        required=True,
        help_text='Email verification token from email'
    )
    
    def validate_token(self, value):
        """Validate token exists and is valid"""
        try:
            token_obj = EmailVerificationToken.objects.get(token=value)
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired token.')
        
        if not token_obj.is_valid:
            raise serializers.ValidationError('This token has expired or been used.')
        
        return token_obj


class PasswordChangeSerializer(serializers.Serializer):
    """
    Change password for authenticated user
    
    TBWS Use Case:
    - Player wants to change password
    - Requires old password for security
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='Current password'
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='New password'
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='Confirm new password'
    )
    
    def validate(self, attrs):
        """Validate old password and new passwords match"""
        user = self.context['request'].user
        
        # Check old password
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({
                'old_password': 'Current password is incorrect.'
            })
        
        # Check new passwords match
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password': 'New passwords do not match.'
            })
        
        # Validate password strength
        try:
            validate_password(attrs['new_password'], user)
        except ValidationError as e:
            raise serializers.ValidationError({
                'new_password': list(e.messages)
            })
        
        return attrs


class ResendVerificationEmailSerializer(serializers.Serializer):
    """
    Resend email verification link
    
    TBWS Use Case:
    - Player didn't receive verification email
    - Request new verification link
    """
    email = serializers.EmailField(
        required=True,
        help_text='Email address to resend verification link'
    )
    
    def validate_email(self, value):
        """Validate email exists and is not verified"""
        email = value.lower()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('No account found with this email.')
        
        if user.email_verified:
            raise serializers.ValidationError('This email is already verified.')
        
        return user
