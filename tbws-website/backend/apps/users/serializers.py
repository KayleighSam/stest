from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, Player


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    Used for reading user data
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'full_name', 'role', 'phone', 'status', 'email_verified',
            'is_active', 'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email_verified', 'is_active', 
            'date_joined', 'created_at', 'updated_at'
        ]
    
    def get_full_name(self, obj):
        """Get user's full name"""
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users
    Includes password validation
    """
    password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'phone', 'password', 'password_confirm'
        ]
    
    def validate_email(self, value):
        """Validate email is unique"""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_username(self, value):
        """Validate username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate(self, attrs):
        """Validate passwords match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({
                "password": list(e.messages)
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create new user with hashed password"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information
    Excludes sensitive fields
    """
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'username'
        ]
    
    def validate_username(self, value):
        """Validate username is unique (excluding current user)"""
        user = self.instance
        if User.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing password
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate new passwords match"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        
        # Validate password strength
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({
                "new_password": list(e.messages)
            })
        
        return attrs
    
    def save(self):
        """Update user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PlayerSerializer(serializers.ModelSerializer):
    """
    Serializer for Player model
    Includes nested user information
    """
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    display_name = serializers.CharField(read_only=True)
    position_display = serializers.CharField(source='get_position_display', read_only=True)
    
    class Meta:
        model = Player
        fields = [
            'id', 'user', 'full_name', 'display_name',
            'jersey_number', 'position', 'position_display',
            'height', 'weight', 'hometown', 'bio', 
            'profile_photo', 'years_active', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlayerCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating player profiles
    Automatically links to authenticated user
    """
    
    class Meta:
        model = Player
        fields = [
            'jersey_number', 'position', 'height', 'weight',
            'hometown', 'bio', 'profile_photo', 'years_active'
        ]
    
    def validate_jersey_number(self, value):
        """Validate jersey number is within valid range"""
        if value is not None and (value < 0 or value > 99):
            raise serializers.ValidationError("Jersey number must be between 0 and 99.")
        return value
    
    def create(self, validated_data):
        """Create player profile for authenticated user"""
        user = self.context['request'].user
        
        # Check if player profile already exists
        if hasattr(user, 'player_profile'):
            raise serializers.ValidationError("Player profile already exists for this user.")
        
        validated_data['user'] = user
        return super().create(validated_data)


class PlayerUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating player profiles
    """
    
    class Meta:
        model = Player
        fields = [
            'jersey_number', 'position', 'height', 'weight',
            'hometown', 'bio', 'profile_photo', 'years_active', 'status'
        ]
    
    def validate_jersey_number(self, value):
        """Validate jersey number is within valid range"""
        if value is not None and (value < 0 or value > 99):
            raise serializers.ValidationError("Jersey number must be between 0 and 99.")
        return value


class PlayerListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing players
    Optimized for list views with minimal data
    """
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    position_display = serializers.CharField(source='get_position_display', read_only=True)
    
    class Meta:
        model = Player
        fields = [
            'id', 'full_name', 'email', 'jersey_number', 
            'position', 'position_display', 'profile_photo', 'status'
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Extended serializer for admin users
    Includes additional fields and permissions
    """
    full_name = serializers.SerializerMethodField()
    is_player = serializers.BooleanField(read_only=True)
    is_manager = serializers.BooleanField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'full_name', 'role', 'phone', 'status', 'email_verified',
            'is_active', 'is_staff', 'is_superuser',
            'is_player', 'is_manager', 'is_admin',
            'last_login', 'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'date_joined', 'created_at', 'updated_at', 'last_login'
        ]
    
    def get_full_name(self, obj):
        """Get user's full name"""
        return obj.get_full_name()