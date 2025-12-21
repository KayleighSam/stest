from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import User, Player
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    PlayerSerializer,
    PlayerCreateSerializer,
    PlayerUpdateSerializer,
    PlayerListSerializer,
    AdminUserSerializer
)
from .permissions import IsOwnerOrAdmin, IsAdminOrReadOnly
from .filters import PlayerFilter


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User CRUD operations
    
    list: Get all users (admin only)
    retrieve: Get single user (owner or admin)
    create: Register new user (public)
    update: Update user (owner or admin)
    partial_update: Partial update (owner or admin)
    destroy: Delete user (admin only)
    
    Additional actions:
    - me: Get current user
    - change_password: Change password
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'email', 'last_name']
    ordering = ['-created_at']
    filterset_fields = ['role', 'status', 'is_active']
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'change_password':
            return PasswordChangeSerializer
        elif self.request.user.is_staff:
            return AdminUserSerializer
        return UserSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action == 'create':
            # Anyone can register
            return [AllowAny()]
        elif self.action in ['list', 'destroy']:
            # Only admins can list all users or delete
            return [IsAdminUser()]
        elif self.action in ['update', 'partial_update', 'retrieve']:
            # Owner or admin can view/update
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        user = self.request.user
        
        if user.is_staff:
            # Admins see all users
            return User.objects.all()
        
        # Regular users only see themselves
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get current authenticated user
        GET /api/users/me/
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_me(self, request):
        """
        Update current authenticated user
        PUT /api/users/update_me/
        """
        serializer = UserUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """
        Change user password
        POST /api/users/change_password/
        
        Body: {
            "old_password": "current_password",
            "new_password": "new_password",
            "new_password_confirm": "new_password"
        }
        """
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "message": "Password changed successfully."
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def activate(self, request, pk=None):
        """
        Activate user account
        POST /api/users/{id}/activate/
        """
        user = self.get_object()
        user.status = 'active'
        user.is_active = True
        user.save()
        return Response({
            "message": f"User {user.email} activated successfully."
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def deactivate(self, request, pk=None):
        """
        Deactivate user account
        POST /api/users/{id}/deactivate/
        """
        user = self.get_object()
        user.status = 'inactive'
        user.is_active = False
        user.save()
        return Response({
            "message": f"User {user.email} deactivated successfully."
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def suspend(self, request, pk=None):
        """
        Suspend user account
        POST /api/users/{id}/suspend/
        """
        user = self.get_object()
        user.status = 'suspended'
        user.is_active = False
        user.save()
        return Response({
            "message": f"User {user.email} suspended successfully."
        })
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def change_role(self, request, pk=None):
        """
        Change user role
        PATCH /api/users/{id}/change_role/
        
        Body: {"role": "manager"}
        """
        user = self.get_object()
        new_role = request.data.get('role')
        
        if not new_role:
            return Response({
                "error": "Role is required."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if new_role not in valid_roles:
            return Response({
                "error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.role = new_role
        user.save()
        
        return Response({
            "message": f"User role changed to {new_role}.",
            "user": UserSerializer(user).data
        })


class PlayerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Player CRUD operations
    
    list: Get all players (public)
    retrieve: Get single player (public)
    create: Create player profile (authenticated)
    update: Update player (owner or admin)
    partial_update: Partial update (owner or admin)
    destroy: Delete player (admin only)
    
    Additional actions:
    - my_profile: Get current user's player profile
    - search: Advanced player search
    """
    queryset = Player.objects.select_related('user').all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PlayerFilter
    search_fields = ['user__first_name', 'user__last_name', 'position', 'hometown']
    ordering_fields = ['jersey_number', 'created_at', 'user__last_name']
    ordering = ['user__last_name']
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'create':
            return PlayerCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PlayerUpdateSerializer
        elif self.action == 'list':
            return PlayerListSerializer
        return PlayerSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            # Anyone can view players
            return [AllowAny()]
        elif self.action == 'create':
            # Authenticated users can create profile
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update']:
            # Owner or admin can update
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters
        """
        queryset = Player.objects.select_related('user').all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by position
        position_filter = self.request.query_params.get('position', None)
        if position_filter:
            queryset = queryset.filter(position=position_filter)
        
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_profile(self, request):
        """
        Get current user's player profile
        GET /api/players/my_profile/
        """
        try:
            player = Player.objects.select_related('user').get(user=request.user)
            serializer = self.get_serializer(player)
            return Response(serializer.data)
        except Player.DoesNotExist:
            return Response({
                "error": "Player profile not found. Please create one first."
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all active players
        GET /api/players/active/
        """
        players = self.get_queryset().filter(status='active')
        serializer = PlayerListSerializer(players, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_position(self, request):
        """
        Get players grouped by position
        GET /api/players/by_position/
        """
        positions = Player.POSITION_CHOICES
        result = {}
        
        for position_code, position_name in positions:
            players = self.get_queryset().filter(
                position=position_code,
                status='active'
            )
            result[position_name] = PlayerListSerializer(players, many=True).data
        
        return Response(result)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def set_status(self, request, pk=None):
        """
        Update player status
        POST /api/players/{id}/set_status/
        
        Body: {"status": "active"}
        """
        player = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({
                "error": "Status is required."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        valid_statuses = [choice[0] for choice in Player.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({
                "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        player.status = new_status
        player.save()
        
        return Response({
            "message": f"Player status updated to {new_status}.",
            "player": PlayerSerializer(player).data
        })
    
    @action(detail=False, methods=['get'])
    def search_advanced(self, request):
        """
        Advanced player search
        GET /api/players/search_advanced/?q=search_term
        """
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({
                "error": "Search query parameter 'q' is required."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Search across multiple fields
        players = self.get_queryset().filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(user__email__icontains=query) |
            Q(hometown__icontains=query) |
            Q(position__icontains=query) |
            Q(bio__icontains=query)
        ).distinct()
        
        serializer = PlayerListSerializer(players, many=True)
        return Response({
            "query": query,
            "count": players.count(),
            "results": serializer.data
        })