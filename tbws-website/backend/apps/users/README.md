# Users App

The Users app handles user management and player profiles for the TBWS website.

## Features

- **Custom User Model**: Extended Django user with role-based access control
- **Player Profiles**: Basketball-specific player information
- **Authentication**: JWT-based authentication with access/refresh tokens
- **Authorization**: Role-based permissions (Player, Manager, Admin, Super Admin)
- **User Management**: CRUD operations for users and players
- **Advanced Filtering**: Search and filter users/players by multiple criteria
- **Profile Management**: Users can manage their own profiles

## Models

### User Model

Custom user model extending `AbstractUser` with additional fields:

**Fields:**
- `email` (unique, required) - Primary authentication field
- `username` (unique, required)
- `first_name`, `last_name`
- `role` - User role (player, manager, admin, super_admin)
- `phone` - Contact number
- `status` - Account status (active, inactive, suspended)
- `email_verified` - Email verification status
- `created_at`, `updated_at` - Timestamps

**Properties:**
- `is_player` - Check if user is a player
- `is_manager` - Check if user has manager privileges
- `is_admin` - Check if user has admin privileges
- `is_super_admin` - Check if user is super admin
- `can_manage_users()` - Check user management permission
- `can_manage_content()` - Check content management permission

### Player Model

Player profile with basketball-specific information:

**Fields:**
- `user` (OneToOne) - Related user account
- `jersey_number` - Player's jersey number (0-99)
- `position` - Playing position (PG, SG, SF, PF, C)
- `height` - Player height
- `weight` - Player weight
- `hometown` - Player's hometown
- `bio` - Player biography
- `profile_photo` - Profile picture
- `years_active` - Years active (e.g., "2020-Present")
- `status` - Player status (active, inactive, retired)
- `created_at`, `updated_at` - Timestamps

**Properties:**
- `full_name` - Get player's full name
- `display_name` - Full name with jersey number

## API Endpoints

### User Endpoints

```
POST   /api/users/                  - Register new user (public)
GET    /api/users/                  - List all users (admin only)
GET    /api/users/{id}/             - Get user details (owner/admin)
PUT    /api/users/{id}/             - Update user (owner/admin)
PATCH  /api/users/{id}/             - Partial update (owner/admin)
DELETE /api/users/{id}/             - Delete user (admin only)

GET    /api/users/me/               - Get current user
PUT    /api/users/update_me/        - Update current user
POST   /api/users/change_password/  - Change password

POST   /api/users/{id}/activate/    - Activate user (admin)
POST   /api/users/{id}/deactivate/  - Deactivate user (admin)
POST   /api/users/{id}/suspend/     - Suspend user (admin)
PATCH  /api/users/{id}/change_role/ - Change user role (admin)
```

### Player Endpoints

```
GET    /api/players/                - List all players (public)
POST   /api/players/                - Create player profile (authenticated)
GET    /api/players/{id}/           - Get player details (public)
PUT    /api/players/{id}/           - Update player (owner/admin)
PATCH  /api/players/{id}/           - Partial update (owner/admin)
DELETE /api/players/{id}/           - Delete player (admin only)

GET    /api/players/my_profile/     - Get current user's profile
GET    /api/players/active/         - Get all active players
GET    /api/players/by_position/    - Get players grouped by position
GET    /api/players/search_advanced/?q=term - Advanced search
POST   /api/players/{id}/set_status/ - Update player status
```

## Filtering & Search

### User Filters

```
?role=player                - Filter by role
?status=active              - Filter by status
?is_active=true             - Filter by active status
?email_verified=true        - Filter by verification
?search=john                - Search name/email/username
?ordering=-created_at       - Order results
?joined_after=2024-01-01    - Filter by join date
```

### Player Filters

```
?position=PG                - Filter by position
?status=active              - Filter by status
?jersey_number=23           - Filter by jersey number
?jersey_min=10&jersey_max=30 - Jersey number range
?hometown=nairobi           - Filter by hometown (contains)
?search=john                - Search name/hometown/bio
?ordering=jersey_number     - Order results
?created_after=2024-01-01   - Filter by creation date
```

## Permissions

### Custom Permission Classes

- **IsOwnerOrAdmin**: Owner of object or admin can access
- **IsAdminOrReadOnly**: Anyone can read, only admins can write
- **IsPlayerOwner**: Only player owner can access their profile
- **IsManager**: Only managers and above can access
- **IsSuperAdmin**: Only super admins can access
- **CanManageUsers**: Users who can manage other users
- **CanManageContent**: Users who can manage content

## Serializers

### User Serializers

- `UserSerializer` - Read user data
- `UserCreateSerializer` - Create new user with validation
- `UserUpdateSerializer` - Update user information
- `PasswordChangeSerializer` - Change password
- `AdminUserSerializer` - Extended fields for admins

### Player Serializers

- `PlayerSerializer` - Complete player data with nested user
- `PlayerCreateSerializer` - Create player profile
- `PlayerUpdateSerializer` - Update player profile
- `PlayerListSerializer` - Lightweight list view

## Usage Examples

### Register New User

```python
POST /api/users/
{
    "email": "player@example.com",
    "username": "player1",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+254712345678",
    "password": "securepass123!",
    "password_confirm": "securepass123!"
}
```

### Create Player Profile

```python
POST /api/players/
Headers: Authorization: Bearer <access_token>
{
    "jersey_number": 23,
    "position": "PG",
    "height": "6'2\"",
    "weight": "180 lbs",
    "hometown": "Nairobi",
    "bio": "Point guard with 5 years experience"
}
```

### Update Player Profile

```python
PATCH /api/players/{id}/
Headers: Authorization: Bearer <access_token>
{
    "bio": "Updated biography",
    "years_active": "2020-Present"
}
```

### Search Players

```python
GET /api/players/search_advanced/?q=nairobi
GET /api/players/?position=PG&status=active
GET /api/players/?search=john&ordering=-created_at
```

## Admin Interface

The Django admin provides full management capabilities:

### User Admin Features

- List view with filters (role, status, verified)
- Search by email, username, name
- Bulk actions (activate, deactivate, verify emails)
- Custom fieldsets for organization
- Readonly timestamps

### Player Admin Features

- List view with jersey numbers and positions
- Search by name, email, jersey, hometown
- Filter by status, position
- Bulk actions (activate, retire, make inactive)
- Autocomplete for user selection

## Testing

Run tests with:

```bash
python manage.py test apps.users
```

Test coverage includes:
- Model creation and validation
- API endpoints (CRUD operations)
- Authentication and permissions
- Filtering and search
- Custom actions
- Signal handlers

## Security

- Passwords hashed with Django's PBKDF2
- JWT tokens for API authentication
- Role-based access control
- Email verification support
- Account status management
- Password strength validation

## Future Enhancements

- [ ] Email notifications (welcome, verification, password reset)
- [ ] Social authentication (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Activity logging
- [ ] Player statistics integration
- [ ] Team roster management
- [ ] Profile completeness tracking
- [ ] Avatar generation for players without photos

## Dependencies

- Django 5.0+
- Django REST Framework
- djangorestframework-simplejwt
- django-filter
- Pillow (for image handling)

## File Structure

```
apps/users/
├── __init__.py
├── admin.py          # Django admin configuration
├── apps.py           # App configuration
├── filters.py        # Custom filters for DRF
├── models.py         # User and Player models
├── permissions.py    # Custom permission classes
├── serializers.py    # DRF serializers
├── signals.py        # Signal handlers
├── tests.py          # Test cases
├── urls.py           # URL routing
└── views.py          # API views
```

## Notes

- Email is used as the primary authentication field (USERNAME_FIELD)
- Creating a Player profile automatically sets user role to 'player'
- Jersey numbers must be between 0-99
- Profile photos are stored in `media/players/photos/`
- All timestamps are timezone-aware (UTC)

## Support

For issues or questions, contact the development team.