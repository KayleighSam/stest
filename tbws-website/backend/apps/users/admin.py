from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Player


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin for User model
    """
    list_display = [
        'email', 'username', 'full_name_display', 'role', 
        'status', 'email_verified', 'is_active', 'created_at'
    ]
    list_filter = [
        'role', 'status', 'is_active', 'is_staff', 
        'email_verified', 'date_joined'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('email', 'username', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone')
        }),
        ('Permissions', {
            'fields': (
                'role', 'status', 'is_active', 'is_staff', 
                'is_superuser', 'email_verified', 'groups', 'user_permissions'
            )
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'username', 'first_name', 'last_name',
                'password1', 'password2', 'role', 'status'
            ),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'date_joined', 'last_login']
    
    def full_name_display(self, obj):
        """Display full name"""
        return obj.get_full_name() or '-'
    full_name_display.short_description = 'Full Name'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related()
    
    actions = ['activate_users', 'deactivate_users', 'verify_emails']
    
    def activate_users(self, request, queryset):
        """Bulk activate users"""
        updated = queryset.update(status='active', is_active=True)
        self.message_user(request, f'{updated} user(s) activated successfully.')
    activate_users.short_description = 'Activate selected users'
    
    def deactivate_users(self, request, queryset):
        """Bulk deactivate users"""
        updated = queryset.update(status='inactive', is_active=False)
        self.message_user(request, f'{updated} user(s) deactivated successfully.')
    deactivate_users.short_description = 'Deactivate selected users'
    
    def verify_emails(self, request, queryset):
        """Bulk verify emails"""
        updated = queryset.update(email_verified=True)
        self.message_user(request, f'{updated} email(s) verified successfully.')
    verify_emails.short_description = 'Verify emails for selected users'


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    """
    Custom admin for Player model
    """
    list_display = [
        'display_name_with_jersey', 'email_display', 'position', 
        'status', 'hometown', 'created_at'
    ]
    list_filter = ['status', 'position', 'created_at']
    search_fields = [
        'user__first_name', 'user__last_name', 'user__email',
        'jersey_number', 'hometown', 'position'
    ]
    ordering = ['user__last_name', 'user__first_name']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Player Details', {
            'fields': (
                'jersey_number', 'position', 'height', 
                'weight', 'hometown', 'years_active'
            )
        }),
        ('Profile', {
            'fields': ('bio', 'profile_photo', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    autocomplete_fields = ['user']
    
    def display_name_with_jersey(self, obj):
        """Display player name with jersey number"""
        if obj.jersey_number:
            return f"#{obj.jersey_number} {obj.full_name}"
        return obj.full_name
    display_name_with_jersey.short_description = 'Player'
    display_name_with_jersey.admin_order_field = 'user__last_name'
    
    def email_display(self, obj):
        """Display user email"""
        return obj.user.email
    email_display.short_description = 'Email'
    email_display.admin_order_field = 'user__email'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('user')
    
    actions = ['activate_players', 'retire_players', 'make_inactive']
    
    def activate_players(self, request, queryset):
        """Bulk activate players"""
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} player(s) activated successfully.')
    activate_players.short_description = 'Activate selected players'
    
    def retire_players(self, request, queryset):
        """Bulk retire players"""
        updated = queryset.update(status='retired')
        self.message_user(request, f'{updated} player(s) retired successfully.')
    retire_players.short_description = 'Retire selected players'
    
    def make_inactive(self, request, queryset):
        """Bulk make players inactive"""
        updated = queryset.update(status='inactive')
        self.message_user(request, f'{updated} player(s) made inactive successfully.')
    make_inactive.short_description = 'Make selected players inactive'
    
    def save_model(self, request, obj, form, change):
        """Override save to ensure user has player role"""
        super().save_model(request, obj, form, change)
        if obj.user.role != 'player':
            obj.user.role = 'player'
            obj.user.save()