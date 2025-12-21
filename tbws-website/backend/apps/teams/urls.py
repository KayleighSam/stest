"""
Teams URL Configuration

Routes:
- GET/POST /api/teams/ - List/Create teams
- GET/PUT/PATCH/DELETE /api/teams/{id}/ - Team CRUD
- GET /api/teams/{id}/roster/ - Team roster
- POST /api/teams/{id}/add-player/ - Add player to team
- POST /api/teams/{id}/remove-player/ - Remove player
- GET/POST /api/teams/{id}/stats/ - Team statistics
- GET /api/teams/by-division/ - Filter by division
- GET /api/teams/standings/ - League standings

- GET/POST /api/team-members/ - List/Create members
- GET/PUT/PATCH/DELETE /api/team-members/{id}/ - Member CRUD

- GET/POST /api/team-stats/ - List/Create stats
- GET/PUT/PATCH/DELETE /api/team-stats/{id}/ - Stats CRUD
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, TeamMemberViewSet, TeamStatsViewSet

app_name = 'teams'

# Create router
router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'team-members', TeamMemberViewSet, basename='team-member')
router.register(r'team-stats', TeamStatsViewSet, basename='team-stats')

urlpatterns = [
    path('', include(router.urls)),
]
