"""
Authentication Admin Configuration
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import PasswordResetToken, EmailVerificationToken, LoginHistory


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin configuration for password reset tokens"""
    
    list_display = [
        'user_email',
        'token_preview',
        'created_at',
        'expires_at',
        'is_used',
        'validity_status'
    ]
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['user__email', 'user__username', 'token']
    readonly_fields = ['token', 'created_at', 'expires_at', 'ip_address']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Token Details', {
            'fields': ('token', 'is_used', 'ip_address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at')
        }),
    )
    
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def token_preview(self, obj):
        """Display token preview"""
        token_str = str(obj.token)
        return f"{token_str[:8]}...{token_str[-8:]}"
    token_preview.short_description = 'Token'
    
    def validity_status(self, obj):
        """Display validity status with color"""
        if obj.is_valid:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Valid</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Invalid</span>'
        )
    validity_status.short_description = 'Status'
    
    def has_add_permission(self, request):
        """Don't allow manual creation"""
        return False


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Admin configuration for email verification tokens"""
    
    list_display = [
        'user_email',
        'token_preview',
        'created_at',
        'expires_at',
        'is_verified',
        'validity_status'
    ]
    list_filter = ['is_verified', 'created_at', 'expires_at']
    search_fields = ['user__email', 'user__username', 'token']
    readonly_fields = ['token', 'created_at', 'expires_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Token Details', {
            'fields': ('token', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at')
        }),
    )
    
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def token_preview(self, obj):
        """Display token preview"""
        token_str = str(obj.token)
        return f"{token_str[:8]}...{token_str[-8:]}"
    token_preview.short_description = 'Token'
    
    def validity_status(self, obj):
        """Display validity status with color"""
        if obj.is_valid:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Valid</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Invalid</span>'
        )
    validity_status.short_description = 'Status'
    
    def has_add_permission(self, request):
        """Don't allow manual creation"""
        return False
    
    actions = ['mark_as_verified']
    
    def mark_as_verified(self, request, queryset):
        """Bulk action to mark tokens as verified"""
        count = 0
        for token in queryset:
            if not token.is_verified:
                token.mark_as_verified()
                count += 1
        self.message_user(
            request,
            f'{count} email(s) verified successfully.'
        )
    mark_as_verified.short_description = 'Mark selected as verified'


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    """Admin configuration for login history"""
    
    list_display = [
        'user_email',
        'login_time',
        'ip_address',
        'success_status',
        'location'
    ]
    list_filter = ['success', 'login_time']
    search_fields = [
        'user__email',
        'user__username',
        'ip_address',
        'location'
    ]
    readonly_fields = [
        'user',
        'login_time',
        'ip_address',
        'user_agent',
        'location',
        'success',
        'failure_reason'
    ]
    date_hierarchy = 'login_time'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Login Details', {
            'fields': (
                'login_time',
                'ip_address',
                'user_agent',
                'location'
            )
        }),
        ('Status', {
            'fields': ('success', 'failure_reason')
        }),
    )
    
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def success_status(self, obj):
        """Display success status with color"""
        if obj.success:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Success</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Failed</span>'
        )
    success_status.short_description = 'Status'
    success_status.admin_order_field = 'success'
    
    def has_add_permission(self, request):
        """Don't allow manual creation"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Don't allow editing"""
        return False
