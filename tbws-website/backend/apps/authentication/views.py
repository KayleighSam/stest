"""
Authentication Views

API Endpoints:
- POST /api/auth/login/ - Login with email/password
- POST /api/auth/logout/ - Logout (blacklist refresh token)
- POST /api/auth/password-reset/ - Request password reset email
- POST /api/auth/password-reset/confirm/ - Confirm password reset with token
- POST /api/auth/password-change/ - Change password (authenticated)
- POST /api/auth/email-verify/ - Verify email with token
- POST /api/auth/email-verify/resend/ - Resend verification email
- GET /api/auth/me/ - Get current user info
- GET /api/auth/login-history/ - Get user's login history
"""

from rest_framework import status, views, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

from apps.users.serializers import UserSerializer
from .serializers import (
    CustomTokenObtainPairSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    PasswordChangeSerializer,
    ResendVerificationEmailSerializer,
)
from .models import PasswordResetToken, EmailVerificationToken, LoginHistory


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token generation view
    
    POST /api/auth/token/
    Body: {"email": "user@example.com", "password": "password"}
    Returns: {"access": "...", "refresh": "...", "user": {...}}
    """
    serializer_class = CustomTokenObtainPairSerializer


class LoginView(views.APIView):
    """
    User login endpoint
    
    POST /api/auth/login/
    Body: {
        "email": "player@tbws.com",
        "password": "password123"
    }
    
    Returns: {
        "access": "eyJ...",
        "refresh": "eyJ...",
        "user": {
            "id": 1,
            "email": "player@tbws.com",
            "first_name": "John",
            ...
        }
    }
    
    TBWS Use Case:
    - Player logs into mobile app
    - Manager logs into dashboard
    - Admin logs into admin panel
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle login request"""
        serializer = LoginSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['email'] = user.email
        refresh['role'] = user.role
        
        # Log successful login
        LoginHistory.objects.create(
            user=user,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            success=True
        )
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class LogoutView(views.APIView):
    """
    User logout endpoint
    
    POST /api/auth/logout/
    Body: {"refresh": "refresh_token"}
    
    Blacklists the refresh token so it can't be used again
    
    TBWS Use Case:
    - Player logs out of mobile app
    - Clear authentication tokens
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Handle logout request"""
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({
                    'error': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(views.APIView):
    """
    Request password reset email
    
    POST /api/auth/password-reset/
    Body: {"email": "player@tbws.com"}
    
    TBWS Use Case:
    - Player forgot password
    - Send password reset link via email
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle password reset request"""
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Create password reset token
            reset_token = PasswordResetToken.objects.create(
                user=user,
                ip_address=self.get_client_ip(request)
            )
            
            # Send email (TODO: implement email template)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}"
            
            # For now, just return token in development
            if settings.DEBUG:
                return Response({
                    'message': 'Password reset link generated',
                    'reset_url': reset_url,
                    'token': str(reset_token.token),
                    'note': 'In production, this will be sent via email'
                }, status=status.HTTP_200_OK)
            
            # TODO: Send actual email in production
            # send_mail(
            #     subject='Password Reset - TBWS',
            #     message=f'Click here to reset your password: {reset_url}',
            #     from_email=settings.DEFAULT_FROM_EMAIL,
            #     recipient_list=[user.email],
            # )
            
        except User.DoesNotExist:
            # Don't reveal if email exists (security)
            pass
        
        return Response({
            'message': 'If an account exists with this email, a password reset link has been sent.'
        }, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PasswordResetConfirmView(views.APIView):
    """
    Confirm password reset with token
    
    POST /api/auth/password-reset/confirm/
    Body: {
        "token": "uuid-token",
        "password": "newpassword123",
        "password_confirm": "newpassword123"
    }
    
    TBWS Use Case:
    - Player clicks reset link
    - Enters new password
    - Password gets updated
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle password reset confirmation"""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_obj = serializer.validated_data['token_obj']
        new_password = serializer.validated_data['password']
        
        # Update user password
        user = token_obj.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        token_obj.mark_as_used()
        
        # Invalidate all existing tokens for this user
        # (Force re-login for security)
        
        return Response({
            'message': 'Password has been reset successfully. Please login with your new password.'
        }, status=status.HTTP_200_OK)


class PasswordChangeView(views.APIView):
    """
    Change password for authenticated user
    
    POST /api/auth/password-change/
    Body: {
        "old_password": "currentpassword",
        "new_password": "newpassword123",
        "new_password_confirm": "newpassword123"
    }
    
    TBWS Use Case:
    - Player wants to update password
    - Requires current password for security
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Handle password change"""
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Update password
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully. Please login again with your new password.'
        }, status=status.HTTP_200_OK)


class EmailVerificationView(views.APIView):
    """
    Verify email with token
    
    POST /api/auth/email-verify/
    Body: {"token": "uuid-token"}
    
    TBWS Use Case:
    - New player clicks verification link in email
    - Email gets verified
    - Account becomes fully active
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle email verification"""
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_obj = serializer.validated_data['token']
        
        # Mark as verified
        token_obj.mark_as_verified()
        
        return Response({
            'message': 'Email verified successfully! You can now login.'
        }, status=status.HTTP_200_OK)


class ResendVerificationEmailView(views.APIView):
    """
    Resend email verification link
    
    POST /api/auth/email-verify/resend/
    Body: {"email": "player@tbws.com"}
    
    TBWS Use Case:
    - Player didn't receive verification email
    - Request new verification link
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle resend verification email"""
        serializer = ResendVerificationEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['email']
        
        # Create new verification token
        verification_token = EmailVerificationToken.objects.create(user=user)
        
        # Send email (TODO: implement email template)
        verify_url = f"{settings.FRONTEND_URL}/verify-email/{verification_token.token}"
        
        # For now, just return token in development
        if settings.DEBUG:
            return Response({
                'message': 'Verification link generated',
                'verify_url': verify_url,
                'token': str(verification_token.token),
                'note': 'In production, this will be sent via email'
            }, status=status.HTTP_200_OK)
        
        # TODO: Send actual email in production
        
        return Response({
            'message': 'Verification email has been sent.'
        }, status=status.HTTP_200_OK)


class CurrentUserView(views.APIView):
    """
    Get current authenticated user
    
    GET /api/auth/me/
    
    TBWS Use Case:
    - Check who is logged in
    - Get current user role and permissions
    - Display user info in app header
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return current user data"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LoginHistoryView(generics.ListAPIView):
    """
    Get user's login history
    
    GET /api/auth/login-history/
    
    TBWS Use Case:
    - User can see their login history
    - Security monitoring
    - Detect unauthorized access
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return login history for current user"""
        return LoginHistory.objects.filter(
            user=self.request.user,
            success=True
        )[:20]  # Last 20 logins
    
    def list(self, request, *args, **kwargs):
        """Return formatted login history"""
        queryset = self.get_queryset()
        
        history = []
        for login in queryset:
            history.append({
                'login_time': login.login_time,
                'ip_address': login.ip_address,
                'user_agent': login.user_agent,
                'location': login.location,
            })
        
        return Response({
            'count': len(history),
            'results': history
        })


# Utility view for testing
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_token_view(request):
    """
    Test endpoint to verify token authentication
    
    GET /api/auth/test-token/
    
    Returns user info if token is valid
    """
    return Response({
        'message': 'Token is valid',
        'user': UserSerializer(request.user).data
    })
