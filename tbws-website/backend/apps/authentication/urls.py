"""
Authentication URL Configuration

Routes:
- POST /api/auth/login/ - Login
- POST /api/auth/logout/ - Logout
- POST /api/auth/password-reset/ - Request password reset
- POST /api/auth/password-reset/confirm/ - Confirm password reset
- POST /api/auth/password-change/ - Change password
- POST /api/auth/email-verify/ - Verify email
- POST /api/auth/email-verify/resend/ - Resend verification
- GET /api/auth/me/ - Get current user
- GET /api/auth/login-history/ - Get login history
- GET /api/auth/test-token/ - Test token validity
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    CustomTokenObtainPairView,
    LoginView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordChangeView,
    EmailVerificationView,
    ResendVerificationEmailView,
    CurrentUserView,
    LoginHistoryView,
    test_token_view,
)

app_name = 'authentication'

urlpatterns = [
    # JWT Token endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Password management
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password-change/', PasswordChangeView.as_view(), name='password_change'),
    
    # Email verification
    path('email-verify/', EmailVerificationView.as_view(), name='email_verify'),
    path('email-verify/resend/', ResendVerificationEmailView.as_view(), name='email_verify_resend'),
    
    # User info
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('login-history/', LoginHistoryView.as_view(), name='login_history'),
    
    # Testing
    path('test-token/', test_token_view, name='test_token'),
]
