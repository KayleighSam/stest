"""
Authentication App for TBWS

This app handles:
- User login and logout
- JWT token management
- Password reset and change
- Email verification
- Token refresh and blacklist
- Session management

Dependencies:
- djangorestframework-simplejwt
- django.contrib.auth
- apps.users (User model)
"""

default_app_config = 'apps.authentication.apps.AuthenticationConfig'
