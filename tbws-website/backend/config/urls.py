"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/

TBWS (Tusker Basketball Welfare Society) URL Configuration
This file includes all URL routing for the TBWS backend:
- Admin interface
- API endpoints for users, players, teams, tournaments, etc.
- Authentication endpoints (JWT)
- Content Management System (CMS)
- Media file serving (development only)
- API documentation (optional)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView,
)

# Customize Django Admin
admin.site.site_header = "TBWS Administration"
admin.site.site_title = "TBWS Admin Portal"
admin.site.index_title = "Welcome to Tusker Basketball Welfare Society Admin"

urlpatterns = [
    # ============================================================================
    # Django Admin
    # ============================================================================
    path("admin/", admin.site.urls),
    
    # ============================================================================
    # CKEditor (Rich Text Editor for Content Management)
    # ============================================================================
    path('ckeditor/', include('ckeditor_uploader.urls')),
    
    # ============================================================================
    # JWT Authentication Endpoints
    # ============================================================================
    # These endpoints handle JWT token generation and management
    
    # Obtain token pair (access + refresh)
    # POST: {"email": "user@example.com", "password": "password"}
    # Returns: {"access": "...", "refresh": "..."}
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Refresh access token
    # POST: {"refresh": "..."}
    # Returns: {"access": "..."}
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Verify token validity
    # POST: {"token": "..."}
    # Returns: {} (200 OK if valid)
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Blacklist refresh token (logout)
    # POST: {"refresh": "..."}
    # Returns: {} (200 OK)
    path('api/auth/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/', include('apps.pages.urls')),  # NEW: Pages API
    path('api/gallery/', include('apps.gallery.urls')),  # NEW: Gallery API
    
    # ============================================================================
    # TBWS API Endpoints - PHASE 1
    # ============================================================================
    
    # Users & Players API
    # Includes:
    # - POST   /api/users/                  - Register new user
    # - GET    /api/users/                  - List users (admin)
    # - GET    /api/users/{id}/             - Get user details
    # - PUT    /api/users/{id}/             - Update user
    # - DELETE /api/users/{id}/             - Delete user (admin)
    # - GET    /api/users/me/               - Get current user
    # - POST   /api/users/{id}/activate/    - Activate user (admin)
    # - POST   /api/users/{id}/suspend/     - Suspend user (admin)
    # - GET    /api/players/                - List all players
    # - POST   /api/players/                - Create player profile
    # - GET    /api/players/{id}/           - Get player details
    # - PUT    /api/players/{id}/           - Update player
    # - DELETE /api/players/{id}/           - Delete player (admin)
    # - GET    /api/players/my_profile/     - Get current user's profile
    # - GET    /api/players/active/         - Get active players
    # - GET    /api/players/by_position/    - Get players by position
    path('api/', include('apps.users.urls')),
    
    # Authentication API
    # Includes login, logout, password reset, etc.
    path('api/auth/', include('apps.authentication.urls')),
    
    # Teams API
    # Includes team management endpoints
    path('api/', include('apps.teams.urls')),
    
    # Content Management System API (Phase 1)
    # Includes:
    # - GET/POST   /api/content/posts/              - List/Create posts
    # - GET        /api/content/posts/{slug}/       - Get post detail
    # - PUT/DELETE /api/content/posts/{slug}/       - Update/Delete post
    # - GET        /api/content/posts/featured/     - Get featured posts
    # - GET        /api/content/posts/latest/       - Get latest posts
    # - GET        /api/content/posts/upcoming_events/ - Get upcoming events
    # - GET        /api/content/categories/         - List categories
    # - GET        /api/content/tags/               - List tags
    # - POST       /api/content/contact/            - Submit contact form
    # - POST       /api/content/newsletter/         - Subscribe to newsletter
    # - GET/POST   /api/content/comments/           - List/Create comments
    path('api/content/', include('apps.content.urls')),
    
    # ============================================================================
    # Future TBWS API Endpoints - PHASE 2
    # ============================================================================
    # These will be added in Phase 2:
    # path('api/', include('apps.gallery.urls')),      # Photo gallery
    # path('api/', include('apps.pages.urls')),        # Static pages (About, History)
    # path('api/', include('apps.tournaments.urls')),  # Tournament management
    # path('api/', include('apps.stats.urls')),        # Player & team statistics
    # path('api/', include('apps.registrations.urls')), # Tournament registrations
    # path('api/', include('apps.payments.urls')),     # Payment processing
]

# ============================================================================
# API Documentation (Optional)
# ============================================================================
# Uncomment to enable Swagger/ReDoc API documentation
# Requires: pip install drf-yasg

# from rest_framework import permissions
# from drf_yasg.views import get_schema_view
# from drf_yasg import openapi

# schema_view = get_schema_view(
#     openapi.Info(
#         title="TBWS API",
#         default_version='v1',
#         description="Tusker Basketball Welfare Society API Documentation",
#         terms_of_service="https://www.tbws.com/terms/",
#         contact=openapi.Contact(email="info@tbws.com"),
#         license=openapi.License(name="BSD License"),
#     ),
#     public=True,
#     permission_classes=[permissions.AllowAny],
# )

# urlpatterns += [
#     path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
#     path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
# ]


# ============================================================================
# Development Settings
# ============================================================================
# Serve media files in development
# In production, these should be served by nginx/Apache/S3
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Enable Django Debug Toolbar (if installed)
    # Requires: pip install django-debug-toolbar
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass


# ============================================================================
# Custom Error Handlers (Optional)
# ============================================================================
# You can create custom error pages by uncommenting these

# handler400 = 'apps.core.views.bad_request'
# handler403 = 'apps.core.views.permission_denied'
# handler404 = 'apps.core.views.page_not_found'
# handler500 = 'apps.core.views.server_error'