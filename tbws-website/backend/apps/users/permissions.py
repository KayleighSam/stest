from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.is_staff or request.user.is_admin:
            return True
        
        # Check if obj is a User instance
        if hasattr(obj, 'email'):
            return obj == request.user
        
        # Check if obj has a user attribute (like Player)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to anyone,
    but only allow write permissions to admin users.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for authenticated users
        if not request.user or not request.user.is_authenticated:
            return False
        
        # For creation, any authenticated user can create
        if view.action == 'create':
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admin users have full access
        if request.user.is_staff or request.user.is_admin:
            return True
        
        # Check if obj is owned by the user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsPlayerOwner(permissions.BasePermission):
    """
    Permission to only allow players to access their own profile.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.is_staff or request.user.is_admin:
            return True
        
        # Players can only access their own profile
        return obj.user == request.user


class IsManager(permissions.BasePermission):
    """
    Permission to only allow managers and above to access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_manager
        )


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission to only allow super admins to access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_super_admin
        )


class CanManageUsers(permissions.BasePermission):
    """
    Permission for users who can manage other users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.can_manage_users()
        )


class CanManageContent(permissions.BasePermission):
    """
    Permission for users who can manage content.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.can_manage_content()
        )