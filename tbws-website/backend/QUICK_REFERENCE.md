# TBWS Users App - Quick Reference

## 📁 Files Created (13 files)

```
apps/users/
├── __init__.py          ✅ Package init
├── README.md            ✅ Full documentation
├── admin.py             ✅ Django admin config
├── apps.py              ✅ App configuration
├── filters.py           ✅ DRF filters
├── models.py            ✅ User & Player models
├── permissions.py       ✅ 7 custom permissions
├── serializers.py       ✅ 11 serializers
├── signals.py           ✅ Signal handlers
├── tests.py             ✅ 30+ test cases
├── urls.py              ✅ URL routing
├── views.py             ✅ ViewSets
└── migrations/
    └── __init__.py      ✅ Migrations package
```

## 🔑 Key Models

### User
- Email-based authentication
- 4 roles: Player, Manager, Admin, Super Admin
- 3 statuses: Active, Inactive, Suspended
- Properties: `is_player`, `is_manager`, `is_admin`

### Player
- Jersey number (0-99)
- Position: PG, SG, SF, PF, C
- Profile photo, bio, hometown
- Status: Active, Inactive, Retired

## 🌐 API Endpoints (25 total)

### Users (14)
```
POST   /api/users/                    Register
GET    /api/users/                    List (admin)
GET    /api/users/{id}/               Get user
PUT    /api/users/{id}/               Update user
GET    /api/users/me/                 Current user
PUT    /api/users/update_me/          Update current
POST   /api/users/change_password/    Change password
POST   /api/users/{id}/activate/      Activate (admin)
POST   /api/users/{id}/deactivate/    Deactivate (admin)
POST   /api/users/{id}/suspend/       Suspend (admin)
PATCH  /api/users/{id}/change_role/   Change role (admin)
```

### Players (11)
```
GET    /api/players/                  List all
POST   /api/players/                  Create profile
GET    /api/players/{id}/             Get player
PUT    /api/players/{id}/             Update player
GET    /api/players/my_profile/       My profile
GET    /api/players/active/           Active players
GET    /api/players/by_position/      By position
GET    /api/players/search_advanced/  Search
POST   /api/players/{id}/set_status/  Update status
```

## 🔒 Permissions

| Permission | Description |
|------------|-------------|
| `IsOwnerOrAdmin` | Owner or admin access |
| `IsAdminOrReadOnly` | Public read, admin write |
| `IsPlayerOwner` | Only player owner |
| `IsManager` | Manager and above |
| `IsSuperAdmin` | Super admin only |
| `CanManageUsers` | User management |
| `CanManageContent` | Content management |

## 🔍 Filtering Examples

```bash
# Users
?role=player
?status=active
?search=john
?ordering=-created_at

# Players
?position=PG
?status=active
?jersey_number=23
?hometown=nairobi
?search=john
```

## 📊 Serializers

**User:** UserSerializer, UserCreateSerializer, UserUpdateSerializer, PasswordChangeSerializer, AdminUserSerializer

**Player:** PlayerSerializer, PlayerCreateSerializer, PlayerUpdateSerializer, PlayerListSerializer

## 🧪 Running Tests

```bash
# All tests
python manage.py test apps.users

# With coverage
coverage run --source='.' manage.py test apps.users
coverage report

# Specific test class
python manage.py test apps.users.tests.UserModelTest
```

## 🚀 Quick Setup

```bash
# 1. Add to INSTALLED_APPS
'apps.users',

# 2. Set custom user model
AUTH_USER_MODEL = 'users.User'

# 3. Run migrations
python manage.py makemigrations
python manage.py migrate

# 4. Create superuser
python manage.py createsuperuser

# 5. Run server
python manage.py runserver
```

## 📝 Example Usage

### Register User
```python
POST /api/users/
{
    "email": "user@example.com",
    "username": "player1",
    "first_name": "John",
    "last_name": "Doe",
    "password": "secure123!",
    "password_confirm": "secure123!"
}
```

### Create Player Profile
```python
POST /api/players/
Headers: Authorization: Bearer <token>
{
    "jersey_number": 23,
    "position": "PG",
    "height": "6'2\"",
    "weight": "180 lbs",
    "hometown": "Nairobi"
}
```

### Get My Profile
```python
GET /api/players/my_profile/
Headers: Authorization: Bearer <token>
```

## 🎯 Role Hierarchy

```
Super Admin → Admin → Manager → Player
    ↓          ↓        ↓         ↓
  All      All Users  Content   Own Data
 Access    & Content  Only       Only
```

## ⚡ Features

✅ JWT Authentication
✅ Role-based permissions
✅ Advanced filtering
✅ Search functionality
✅ Django admin
✅ Comprehensive tests
✅ Signal handlers
✅ Image uploads
✅ Password validation
✅ Email verification (ready)

## 📦 Dependencies

```
Django>=5.0
djangorestframework
djangorestframework-simplejwt
django-filter
Pillow
```

## 🔐 Security

- PBKDF2 password hashing
- JWT access/refresh tokens
- Role-based access control
- Input validation
- SQL injection protection
- XSS protection

## 📈 Database Indexes

- `users_email_idx`
- `users_status_idx`
- `users_role_idx`
- `players_status_idx`
- `players_jersey_idx`
- `players_position_idx`

## 💡 Tips

1. **Always authenticate** for protected endpoints
2. **Use filters** for efficient queries
3. **Check permissions** before operations
4. **Test thoroughly** before deployment
5. **Monitor** query performance

## 🆘 Common Issues

**Q: Can't create player profile**
A: Ensure user is authenticated

**Q: Permission denied**
A: Check user role and permissions

**Q: Image upload fails**
A: Check MEDIA_ROOT settings

**Q: Tests failing**
A: Run migrations first

## 📚 Documentation

- Full README: `apps/users/README.md`
- Setup Guide: `USERS_APP_GUIDE.md`
- API Docs: Run server and visit `/api/`

## ✅ Status

**COMPLETE** - Ready for integration!

Next apps: Authentication, Teams, or Tournaments