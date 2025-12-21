# 🔐 TBWS Authentication App

## Overview
Complete authentication system for Tusker Basketball Welfare Society (TBWS) backend.

## Features

### ✅ User Authentication
- **Login**: Email/password authentication with JWT tokens
- **Logout**: Token blacklisting for secure logout
- **Session Management**: Track user login history
- **Security**: IP address tracking, user agent logging

### ✅ Password Management
- **Password Reset**: Secure token-based password reset
- **Password Change**: Change password for authenticated users
- **Password Validation**: Strong password requirements
- **Token Expiry**: 24-hour expiration for reset tokens

### ✅ Email Verification
- **Email Verification**: Verify user email on registration
- **Resend Verification**: Request new verification link
- **Token Expiry**: 48-hour expiration for verification tokens
- **Auto-generation**: Automatic token creation on registration

### ✅ Security Features
- **JWT Authentication**: Secure token-based authentication
- **Token Blacklist**: Invalidate tokens on logout
- **Token Refresh**: Refresh expired access tokens
- **Login History**: Track all login attempts
- **IP Tracking**: Record IP addresses for security
- **Failed Login Tracking**: Monitor suspicious activity

## Models

### PasswordResetToken
Stores password reset tokens with 24-hour expiration.

**Fields:**
- `user`: ForeignKey to User
- `token`: UUID (unique)
- `created_at`: Timestamp
- `expires_at`: Expiration time
- `is_used`: Boolean flag
- `ip_address`: Client IP address

### EmailVerificationToken
Stores email verification tokens with 48-hour expiration.

**Fields:**
- `user`: ForeignKey to User
- `token`: UUID (unique)
- `created_at`: Timestamp
- `expires_at`: Expiration time
- `is_verified`: Boolean flag

### LoginHistory
Tracks all login attempts for security monitoring.

**Fields:**
- `user`: ForeignKey to User
- `login_time`: Timestamp
- `ip_address`: Client IP
- `user_agent`: Browser/device info
- `location`: Geographic location (optional)
- `success`: Login success/failure
- `failure_reason`: Reason for failed login

## API Endpoints

### Authentication Endpoints

#### Login
```
POST /api/auth/login/
Body: {
    "email": "player@tbws.com",
    "password": "password123"
}
Response: {
    "access": "eyJ...",
    "refresh": "eyJ...",
    "user": {...},
    "message": "Login successful"
}
```

#### Logout
```
POST /api/auth/logout/
Headers: Authorization: Bearer <access_token>
Body: {
    "refresh": "refresh_token"
}
Response: {
    "message": "Logout successful"
}
```

### Password Management

#### Request Password Reset
```
POST /api/auth/password-reset/
Body: {
    "email": "player@tbws.com"
}
Response: {
    "message": "If an account exists...",
    "reset_url": "http://frontend.com/reset/token" (dev only)
}
```

#### Confirm Password Reset
```
POST /api/auth/password-reset/confirm/
Body: {
    "token": "uuid-token",
    "password": "newpassword123",
    "password_confirm": "newpassword123"
}
Response: {
    "message": "Password has been reset successfully"
}
```

#### Change Password
```
POST /api/auth/password-change/
Headers: Authorization: Bearer <access_token>
Body: {
    "old_password": "currentpassword",
    "new_password": "newpassword123",
    "new_password_confirm": "newpassword123"
}
Response: {
    "message": "Password changed successfully"
}
```

### Email Verification

#### Verify Email
```
POST /api/auth/email-verify/
Body: {
    "token": "uuid-token"
}
Response: {
    "message": "Email verified successfully!"
}
```

#### Resend Verification Email
```
POST /api/auth/email-verify/resend/
Body: {
    "email": "player@tbws.com"
}
Response: {
    "message": "Verification email has been sent",
    "verify_url": "http://frontend.com/verify/token" (dev only)
}
```

### User Information

#### Get Current User
```
GET /api/auth/me/
Headers: Authorization: Bearer <access_token>
Response: {
    "id": 1,
    "email": "player@tbws.com",
    "first_name": "John",
    ...
}
```

#### Get Login History
```
GET /api/auth/login-history/
Headers: Authorization: Bearer <access_token>
Response: {
    "count": 5,
    "results": [
        {
            "login_time": "2024-01-01T10:00:00Z",
            "ip_address": "192.168.1.1",
            "user_agent": "Mozilla/5.0...",
            "location": "Nairobi, Kenya"
        },
        ...
    ]
}
```

### JWT Token Management

#### Refresh Token
```
POST /api/auth/token/refresh/
Body: {
    "refresh": "refresh_token"
}
Response: {
    "access": "new_access_token"
}
```

#### Verify Token
```
POST /api/auth/token/verify/
Body: {
    "token": "access_token"
}
Response: {} (200 OK if valid)
```

## Installation

### 1. Add to INSTALLED_APPS
```python
# config/settings.py
INSTALLED_APPS = [
    ...
    'apps.authentication',
]
```

### 2. Add to URLs
```python
# config/urls.py
urlpatterns = [
    ...
    path('api/auth/', include('apps.authentication.urls')),
]
```

### 3. Configure Settings
```python
# config/settings.py

# Frontend URL for email links
FRONTEND_URL = 'http://localhost:3000'

# Email configuration (for production)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'TBWS <noreply@tbws.com>'
```

### 4. Run Migrations
```bash
python manage.py makemigrations authentication
python manage.py migrate authentication
```

## Usage Examples

### Login Flow
```python
# 1. User logs in
POST /api/auth/login/
{"email": "player@tbws.com", "password": "pass123"}

# Response includes access and refresh tokens
{
    "access": "eyJ...",
    "refresh": "eyJ...",
    "user": {...}
}

# 2. Use access token for API requests
GET /api/users/me/
Headers: Authorization: Bearer eyJ...

# 3. When access token expires, refresh it
POST /api/auth/token/refresh/
{"refresh": "eyJ..."}

# 4. Logout when done
POST /api/auth/logout/
{"refresh": "eyJ..."}
```

### Password Reset Flow
```python
# 1. User requests password reset
POST /api/auth/password-reset/
{"email": "player@tbws.com"}

# 2. User receives email with token
# (In development, token is returned in response)

# 3. User confirms password reset
POST /api/auth/password-reset/confirm/
{
    "token": "uuid-token",
    "password": "newpass123",
    "password_confirm": "newpass123"
}

# 4. User can now login with new password
POST /api/auth/login/
{"email": "player@tbws.com", "password": "newpass123"}
```

### Email Verification Flow
```python
# 1. User registers (handled by users app)
POST /api/users/
{...registration data...}

# 2. Email verification token auto-created
# User receives verification email

# 3. User clicks link and verifies
POST /api/auth/email-verify/
{"token": "uuid-token"}

# 4. User's email is now verified
GET /api/auth/me/
# Response shows email_verified: true
```

## Testing

### Run Tests
```bash
# Run all authentication tests
python manage.py test apps.authentication

# Run specific test
python manage.py test apps.authentication.tests.AuthenticationAPITest.test_login_success

# Run with coverage
coverage run --source='apps.authentication' manage.py test apps.authentication
coverage report
```

### Test Coverage
- ✅ User login (success/failure)
- ✅ Inactive user login
- ✅ Password reset request
- ✅ Password reset confirmation
- ✅ Password change
- ✅ Email verification
- ✅ Token refresh
- ✅ Logout
- ✅ Login history creation
- ✅ Token validity checks

## Security Considerations

### Token Security
- Access tokens expire in 60 minutes
- Refresh tokens expire in 7 days
- Tokens are blacklisted on logout
- Password reset tokens expire in 24 hours
- Email verification tokens expire in 48 hours

### Password Security
- Django's PBKDF2 hashing (default)
- Minimum 8 characters required
- Must include numbers and letters
- Cannot be too similar to user info
- Cannot be a common password

### Login Security
- Failed login attempts tracked
- IP addresses logged
- User agents recorded
- Suspicious activity monitoring
- Account lockout (can be implemented)

## TBWS Use Cases

### Player Registration
1. Player registers via mobile app
2. Verification email sent automatically
3. Player clicks link to verify email
4. Account becomes fully active
5. Player can now login and access features

### Password Recovery
1. Player forgets password
2. Requests password reset
3. Receives reset link via email
4. Sets new password
5. Can login with new credentials

### Session Management
1. Player logs into mobile app
2. Receives access + refresh tokens
3. Access token used for API requests
4. Refresh token used when access expires
5. Logs out to invalidate tokens

### Admin Monitoring
1. Admin views login history
2. Detects suspicious activity
3. Can suspend accounts if needed
4. Reviews failed login attempts
5. Ensures platform security

## Future Enhancements

### Planned Features
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Facebook)
- [ ] Account lockout after failed attempts
- [ ] Email templates for better UX
- [ ] SMS verification option
- [ ] Biometric authentication
- [ ] Remember device feature
- [ ] Session timeout warnings

## Dependencies
- djangorestframework
- djangorestframework-simplejwt
- django.contrib.auth
- apps.users

## File Structure
```
apps/authentication/
├── __init__.py          # App initialization
├── admin.py             # Admin configuration
├── apps.py              # App config
├── models.py            # Database models
├── serializers.py       # API serializers
├── signals.py           # Signal handlers
├── tests.py             # Test cases
├── urls.py              # URL routing
├── views.py             # API views
└── migrations/          # Database migrations
    └── __init__.py
```

## Support
For issues or questions, contact the TBWS development team.

## License
Copyright © 2024 Tusker Basketball Welfare Society
