# 🚀 Authentication App - Integration Guide

## Quick Integration (5 Steps)

### Step 1: Add App to Settings
```python
# config/settings.py

INSTALLED_APPS = [
    ...
    'apps.users',
    'apps.authentication',  # ← Add this
]

# Add frontend URL for email links
FRONTEND_URL = 'http://localhost:3000'  # Change for production
```

### Step 2: Update URLs
```python
# config/urls.py

urlpatterns = [
    ...
    path('api/', include('apps.users.urls')),
    path('api/auth/', include('apps.authentication.urls')),  # ← Add this
]
```

### Step 3: Run Migrations
```bash
python manage.py makemigrations authentication
python manage.py migrate authentication
```

### Step 4: Test the API
```bash
# Start server
python manage.py runserver

# Test login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tbws.com","password":"your-password"}'
```

### Step 5: Done! ✅

---

## All Authentication Endpoints

### Summary
**Total Endpoints: 11**

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/login/` | POST | No | Login with email/password |
| `/api/auth/logout/` | POST | Yes | Logout (blacklist token) |
| `/api/auth/token/refresh/` | POST | No | Refresh access token |
| `/api/auth/token/verify/` | POST | No | Verify token validity |
| `/api/auth/password-reset/` | POST | No | Request password reset |
| `/api/auth/password-reset/confirm/` | POST | No | Confirm password reset |
| `/api/auth/password-change/` | POST | Yes | Change password |
| `/api/auth/email-verify/` | POST | No | Verify email with token |
| `/api/auth/email-verify/resend/` | POST | No | Resend verification email |
| `/api/auth/me/` | GET | Yes | Get current user info |
| `/api/auth/login-history/` | GET | Yes | Get login history |

---

## Testing Checklist

### ✅ Basic Authentication
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Cannot login with inactive account
- [ ] Access token works for authenticated endpoints
- [ ] Can logout and blacklist token

### ✅ Password Management
- [ ] Can request password reset
- [ ] Password reset email sent (or token displayed in dev)
- [ ] Can reset password with valid token
- [ ] Cannot reset with expired/used token
- [ ] Can change password when authenticated
- [ ] Old password required for change

### ✅ Email Verification
- [ ] Verification token created on registration
- [ ] Can verify email with valid token
- [ ] Cannot verify with expired/used token
- [ ] Can resend verification email
- [ ] User email_verified flag updated

### ✅ Token Management
- [ ] Access token expires after 60 minutes
- [ ] Can refresh access token with refresh token
- [ ] Refresh token expires after 7 days
- [ ] Token blacklisted on logout
- [ ] Cannot use blacklisted token

### ✅ Security
- [ ] Login history created on successful login
- [ ] IP address captured
- [ ] Failed logins tracked
- [ ] Passwords hashed (never stored plain)
- [ ] Token validation working

---

## cURL Test Commands

### 1. Register User (from users app)
```bash
curl -X POST http://127.0.0.1:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newplayer@tbws.com",
    "username": "newplayer",
    "first_name": "New",
    "last_name": "Player",
    "phone": "+254712345678",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!"
  }'
```

### 2. Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newplayer@tbws.com",
    "password": "SecurePass123!"
  }'

# Save the access and refresh tokens from response!
```

### 3. Get Current User
```bash
curl -X GET http://127.0.0.1:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Request Password Reset
```bash
curl -X POST http://127.0.0.1:8000/api/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newplayer@tbws.com"
  }'

# In development, response includes reset token
```

### 5. Confirm Password Reset
```bash
curl -X POST http://127.0.0.1:8000/api/auth/password-reset/confirm/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_STEP_4",
    "password": "NewPassword123!",
    "password_confirm": "NewPassword123!"
  }'
```

### 6. Change Password (Authenticated)
```bash
curl -X POST http://127.0.0.1:8000/api/auth/password-change/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "CurrentPassword",
    "new_password": "NewPassword123!",
    "new_password_confirm": "NewPassword123!"
  }'
```

### 7. Verify Email
```bash
curl -X POST http://127.0.0.1:8000/api/auth/email-verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "EMAIL_VERIFICATION_TOKEN"
  }'
```

### 8. Resend Verification Email
```bash
curl -X POST http://127.0.0.1:8000/api/auth/email-verify/resend/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newplayer@tbws.com"
  }'
```

### 9. Get Login History
```bash
curl -X GET http://127.0.0.1:8000/api/auth/login-history/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 10. Refresh Token
```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

### 11. Logout
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Complete Workflow Example

### Player Registration → Verification → Login

```bash
# Step 1: Register
curl -X POST http://127.0.0.1:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jordan@tbws.com",
    "username": "jordan23",
    "first_name": "Michael",
    "last_name": "Jordan",
    "phone": "+254700000000",
    "password": "Bulls23MVP!",
    "password_confirm": "Bulls23MVP!"
  }'

# Response includes user data
# Email verification token printed in console (dev mode)

# Step 2: Verify Email (use token from console)
curl -X POST http://127.0.0.1:8000/api/auth/email-verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "VERIFICATION_TOKEN_FROM_CONSOLE"
  }'

# Step 3: Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jordan@tbws.com",
    "password": "Bulls23MVP!"
  }'

# Response:
# {
#   "access": "eyJ...",
#   "refresh": "eyJ...",
#   "user": {...}
# }

# Step 4: Use access token for API calls
curl -X GET http://127.0.0.1:8000/api/auth/me/ \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

## Django Admin Features

After integration, check Django admin:

1. Go to: http://127.0.0.1:8000/admin/
2. You'll see new sections:
   - **Password Reset Tokens**: View all reset requests
   - **Email Verification Tokens**: View all verification requests
   - **Login History**: Monitor all login attempts

### Admin Actions
- Mark emails as verified
- View token validity status
- Monitor failed login attempts
- Track user activity

---

## Troubleshooting

### Issue: "No module named 'apps.authentication'"
**Solution:**
```bash
# Ensure app is in INSTALLED_APPS in settings.py
# Run migrations
python manage.py makemigrations
python manage.py migrate
```

### Issue: "Token has expired"
**Solution:**
- Access tokens expire in 60 minutes
- Use refresh token to get new access token
- Or login again

### Issue: "Email not verified"
**Solution:**
- Check console for verification token (dev mode)
- Call `/api/auth/email-verify/` with token
- Or resend verification email

### Issue: "Cannot reset password - token invalid"
**Solution:**
- Password reset tokens expire in 24 hours
- Request new reset link
- Tokens can only be used once

---

## Production Checklist

Before deploying to production:

### Email Configuration
```python
# config/settings.py

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'TBWS <noreply@tbws.com>'
```

### Frontend URL
```python
# config/settings.py

FRONTEND_URL = 'https://tbws.com'  # Your production URL
```

### Email Templates
Create email templates in `apps/authentication/templates/`:
- `password_reset_email.html`
- `email_verification.html`
- `welcome_email.html`

### Security Settings
```python
# config/settings.py

# Token lifetimes
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# HTTPS only in production
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

---

## Next Steps

After integrating authentication:

1. ✅ Test all endpoints with Postman
2. ✅ Create email templates for production
3. ✅ Configure SMTP settings
4. ✅ Test password reset flow
5. ✅ Test email verification flow
6. ✅ Build next app: **Teams** or **Tournaments**

---

## Files Created

```
apps/authentication/
├── __init__.py           # App initialization
├── admin.py              # Django admin config (3 models)
├── apps.py               # App configuration
├── models.py             # 3 models (PasswordReset, EmailVerify, LoginHistory)
├── serializers.py        # 7 serializers
├── signals.py            # Auto-create email verification
├── tests.py              # 20+ test cases
├── urls.py               # 11 endpoints
├── views.py              # 11 API views
├── README.md             # Complete documentation
└── migrations/
    └── __init__.py
```

**Total:** 11 files, ~2000 lines of code

---

## Status: ✅ Ready for Integration!

**Time Required:** 5 minutes  
**Difficulty:** Easy  
**Next:** Add to settings → Run migrations → Test endpoints
