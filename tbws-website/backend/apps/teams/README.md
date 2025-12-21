# 🏀 TBWS Teams App

## Overview
Complete team management system for Tusker Basketball Welfare Society (TBWS) backend.

## Features

### ✅ Team Management
- **Team Creation**: Create and manage basketball teams
- **Team Information**: Store team details, logo, colors, division
- **Team Status**: Track active, inactive, or disbanded teams
- **Coach Assignment**: Assign head coach, assistant coaches, managers
- **Contact Information**: Store team email, phone, home venue

### ✅ Team Roster Management
- **Player Assignment**: Add players to team rosters
- **Jersey Numbers**: Assign unique jersey numbers (0-99)
- **Player Roles**: Designate players, captains, vice captains
- **Status Tracking**: Track active, injured, suspended, or left players
- **Join/Leave Dates**: Record when players join or leave teams

### ✅ Team Statistics
- **Season Records**: Track wins, losses, games played
- **Points**: Track points scored and allowed
- **Performance Metrics**: Calculate win percentage, PPG, point differential
- **Streaks**: Track current and longest win/loss streaks
- **Rankings**: Store league and division rankings

### ✅ Advanced Features
- **League Standings**: View standings by season and division
- **Division Filtering**: Filter teams by division (men, women, youth)
- **Search**: Search teams by name or description
- **Roster Views**: View complete team rosters with player details
- **Historical Stats**: Track team performance across seasons

## Models

### Team
Primary team model with all team information.

**Fields:**
- `name`: Team name (unique)
- `short_name`: Short name or abbreviation
- `slug`: URL-friendly identifier
- `founded_date`: Date team was founded
- `division`: Men, Women, Youth, Mixed
- `description`: Team description or history
- `logo`: Team logo image
- `primary_color`: Primary team color (hex)
- `secondary_color`: Secondary team color (hex)
- `head_coach`: ForeignKey to User (head coach)
- `assistant_coaches`: ManyToMany to User
- `manager`: ForeignKey to User (team manager)
- `email`: Team contact email
- `phone`: Team contact phone
- `home_venue`: Home court/venue
- `status`: active, inactive, disbanded

**Properties:**
- `active_players_count`: Count of active players
- `wins`: Total wins from stats
- `losses`: Total losses from stats
- `win_percentage`: Calculated win percentage

### TeamMember
Links players to teams (roster management).

**Fields:**
- `team`: ForeignKey to Team
- `player`: ForeignKey to Player
- `role`: player, captain, vice_captain
- `status`: active, injured, suspended, left
- `jersey_number`: Jersey number (0-99, unique per team)
- `joined_date`: Date joined team
- `left_date`: Date left team (nullable)

**Properties:**
- `is_active`: Check if membership is active

### TeamStats
Team performance statistics by season.

**Fields:**
- `team`: ForeignKey to Team
- `season`: Season identifier (e.g., "2024")
- `games_played`: Total games played
- `wins`: Total wins
- `losses`: Total losses
- `points_scored`: Total points scored
- `points_allowed`: Total points allowed
- `current_streak`: Current win/loss streak
- `longest_win_streak`: Longest winning streak
- `longest_loss_streak`: Longest losing streak
- `league_rank`: League ranking
- `division_rank`: Division ranking

**Properties:**
- `win_percentage`: Calculated win %
- `points_per_game`: Average PPG
- `points_allowed_per_game`: Average points allowed
- `point_differential`: Point differential

## API Endpoints

### Team Endpoints

#### List Teams
```
GET /api/teams/
Query Parameters:
  - status: active, inactive, disbanded
  - division: men, women, youth, mixed
  - search: Search by name
  - ordering: name, created_at, founded_date
```

#### Create Team
```
POST /api/teams/
Body: {
    "name": "Tusker Warriors",
    "short_name": "Warriors",
    "division": "men",
    "description": "Elite basketball team",
    "primary_color": "#FF0000",
    "secondary_color": "#000000"
}
Permissions: Admin only
```

#### Get Team Details
```
GET /api/teams/{id}/
Response: Complete team information
```

#### Update Team
```
PUT/PATCH /api/teams/{id}/
Permissions: Manager or Admin
```

#### Delete Team
```
DELETE /api/teams/{id}/
Permissions: Admin only
```

#### Get Team Roster
```
GET /api/teams/{id}/roster/
Response: {
    "id": 1,
    "name": "Warriors",
    "members": [...],
    "active_players": [...],
    "captains": [...]
}
```

#### Add Player to Team
```
POST /api/teams/{id}/add-player/
Body: {
    "player": 5,
    "jersey_number": 23,
    "role": "player"
}
Permissions: Manager or Admin
```

#### Remove Player from Team
```
POST /api/teams/{id}/remove-player/
Body: {
    "player": 5
}
Permissions: Manager or Admin
```

#### Get/Create Team Stats
```
GET /api/teams/{id}/stats/
Response: All season stats for team

POST /api/teams/{id}/stats/
Body: {
    "season": "2024",
    "games_played": 0,
    "wins": 0,
    "losses": 0
}
```

#### Filter by Division
```
GET /api/teams/by-division/?division=men
Response: {
    "division": "men",
    "count": 5,
    "teams": [...]
}
```

#### League Standings
```
GET /api/teams/standings/?season=2024&division=men
Response: {
    "season": "2024",
    "division": "men",
    "standings": [...]
}
```

### Team Member Endpoints

#### List Team Members
```
GET /api/team-members/
Query Parameters:
  - team: Filter by team ID
  - status: active, injured, suspended, left
  - role: player, captain, vice_captain
```

#### Create Team Member
```
POST /api/team-members/
Body: {
    "team": 1,
    "player": 5,
    "jersey_number": 23,
    "role": "player",
    "status": "active"
}
```

#### Update Team Member
```
PUT/PATCH /api/team-members/{id}/
```

#### Delete Team Member
```
DELETE /api/team-members/{id}/
```

### Team Stats Endpoints

#### List Team Stats
```
GET /api/team-stats/
Query Parameters:
  - team: Filter by team ID
  - season: Filter by season
  - min_wins: Minimum wins
```

#### Create Team Stats
```
POST /api/team-stats/
Body: {
    "team": 1,
    "season": "2024",
    "games_played": 10,
    "wins": 7,
    "losses": 3,
    "points_scored": 850,
    "points_allowed": 780
}
```

#### Update Team Stats
```
PUT/PATCH /api/team-stats/{id}/
```

## Installation

### 1. Add to INSTALLED_APPS
```python
# config/settings.py
INSTALLED_APPS = [
    ...
    'apps.users',
    'apps.authentication',
    'apps.teams',  # Add this
]
```

### 2. Add to URLs
```python
# config/urls.py
urlpatterns = [
    ...
    path('api/', include('apps.teams.urls')),
]
```

### 3. Run Migrations
```bash
python manage.py makemigrations teams
python manage.py migrate teams
```

### 4. Test
```bash
python manage.py runserver

# Test endpoints
curl http://127.0.0.1:8000/api/teams/
```

## Usage Examples

### Create a Team
```python
# As admin
POST /api/teams/
{
    "name": "Tusker Warriors",
    "short_name": "Warriors",
    "division": "men",
    "founded_date": "2020-01-15",
    "description": "Premier men's basketball team",
    "primary_color": "#1e3c72",
    "secondary_color": "#2a5298",
    "email": "warriors@tbws.com",
    "phone": "+254712345678",
    "home_venue": "Tusker Arena"
}
```

### Add Player to Team
```python
# As manager
POST /api/teams/1/add-player/
{
    "player": 5,
    "jersey_number": 23,
    "role": "captain"
}
```

### Get Team Roster
```python
GET /api/teams/1/roster/

Response:
{
    "id": 1,
    "name": "Tusker Warriors",
    "members": [
        {
            "id": 1,
            "player_name": "John Doe",
            "jersey_number": 23,
            "role": "captain",
            "status": "active"
        },
        ...
    ]
}
```

### View League Standings
```python
GET /api/teams/standings/?season=2024

Response:
{
    "season": "2024",
    "standings": [
        {
            "team_name": "Warriors",
            "wins": 15,
            "losses": 3,
            "win_percentage": 83.33,
            "points_per_game": 95.5
        },
        ...
    ]
}
```

## Testing

### Run Tests
```bash
# Run all teams tests
python manage.py test apps.teams

# Run specific test
python manage.py test apps.teams.tests.TeamAPITest.test_create_team_admin_only

# Run with coverage
coverage run --source='apps.teams' manage.py test apps.teams
coverage report
```

### Test Coverage
- ✅ Team CRUD operations
- ✅ Team roster management
- ✅ Team statistics tracking
- ✅ Permission checks
- ✅ Jersey number validation
- ✅ League standings
- ✅ Division filtering

## Django Admin

After integration, check Django admin at http://127.0.0.1:8000/admin/

You'll see:
- **Teams**: Manage all teams
- **Team Members**: View and edit rosters
- **Team Statistics**: Track performance

### Admin Features
- Color-coded status badges
- Jersey number displays with team colors
- Win/loss records
- Current streak indicators
- Bulk actions (activate/deactivate teams)
- Search and filter options

## TBWS Use Cases

### Team Management
1. **Create Teams**: Admin creates new teams for the league
2. **Assign Coaches**: Assign head coach and assistant coaches
3. **Update Information**: Keep team details current

### Roster Management
1. **Build Roster**: Manager adds players to team
2. **Assign Jerseys**: Assign unique jersey numbers
3. **Set Captains**: Designate team captain and vice captain
4. **Track Status**: Monitor injured or suspended players

### Statistics Tracking
1. **Record Games**: Update wins and losses
2. **Track Points**: Record points scored and allowed
3. **Monitor Performance**: View win percentage, PPG
4. **League Standings**: Display team rankings

### Public Features
1. **Team Pages**: Public can view team information
2. **Rosters**: View team rosters and players
3. **Standings**: Check league standings
4. **Statistics**: View team performance history

## Permissions

- **Public**: View teams, rosters, stats
- **Players**: View their team information
- **Managers**: Manage their team roster and info
- **Admins**: Full access, create/delete teams

## Future Enhancements

- [ ] Team schedules and fixtures
- [ ] Game results integration
- [ ] Player transfer system
- [ ] Team achievements and trophies
- [ ] Team social media links
- [ ] Team merchandise
- [ ] Fan engagement features
- [ ] Team analytics dashboard

## Dependencies
- apps.users (User and Player models)
- apps.authentication (permissions)
- Pillow (for logo images)

## File Structure
```
apps/teams/
├── __init__.py
├── apps.py
├── models.py          # Team, TeamMember, TeamStats
├── serializers.py     # 10 serializers
├── views.py           # 3 ViewSets
├── urls.py            # URL routing
├── admin.py           # Django admin (3 models)
├── filters.py         # Filter classes
├── signals.py         # Auto-slug, notifications
├── tests.py           # 25+ test cases
├── README.md          # This file
└── migrations/
    └── __init__.py
```

## Support
For issues or questions, contact the TBWS development team.

## License
Copyright © 2024 Tusker Basketball Welfare Society
