from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Page, SiteSettings, TeamMember, FAQ, HistoryTimeline, 
    Sponsor, CoreValue, LeagueRule, Venue, DraftInfo, 
    ManagerInfo, Manager
)


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'subtitle', 'status')
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('Images', {
            'fields': ('hero_image', 'featured_image')
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ('General', {
            'fields': ('site_name', 'tagline', 'description', 'logo', 'favicon')
        }),
        ('Hero Section', {
            'fields': ('hero_image',),
            'description': 'Main hero section image displayed on homepage'
        }),
        ('About Section', {
            'fields': ('about_title', 'about_content', 'about_image')
        }),
        ('Mission & Vision', {
            'fields': ('mission_title', 'mission_content', 'vision_title', 'vision_content')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'address')
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'twitter_url', 'instagram_url', 'youtube_url')
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion
        return False


@admin.register(CoreValue)
class CoreValueAdmin(admin.ModelAdmin):
    list_display = ['title', 'icon', 'color_preview', 'order', 'is_active']
    list_filter = ['is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['title', 'description']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'icon'),
            'description': 'Available icons: award, users, target, heart, sparkles, trending'
        }),
        ('Styling', {
            'fields': ('color_start', 'color_end'),
            'description': 'Use hex color codes (e.g., #3b82f6, #60a5fa)'
        }),
        ('Display', {
            'fields': ('order', 'is_active')
        }),
    )
    
    def color_preview(self, obj):
        return format_html(
            '<div style="display: flex; gap: 5px;">'
            '<span style="background: {}; width: 30px; height: 20px; border-radius: 3px; display: inline-block;"></span>'
            '<span style="background: {}; width: 30px; height: 20px; border-radius: 3px; display: inline-block;"></span>'
            '</div>',
            obj.color_start,
            obj.color_end
        )
    color_preview.short_description = 'Gradient'


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'title', 'order', 'is_active']
    list_filter = ['role', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['name', 'title', 'bio']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'role', 'title', 'bio', 'photo')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone')
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'twitter_url', 'linkedin_url'),
            'classes': ('collapse',)
        }),
        ('Display', {
            'fields': ('order', 'is_active', 'joined_date')
        }),
    )


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'order', 'is_active']
    list_filter = ['category', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['question', 'answer']
    
    fieldsets = (
        ('Question & Answer', {
            'fields': ('question', 'answer', 'category')
        }),
        ('Display', {
            'fields': ('order', 'is_active')
        }),
    )


@admin.register(HistoryTimeline)
class HistoryTimelineAdmin(admin.ModelAdmin):
    list_display = ['year', 'title', 'milestone_badge', 'order']
    list_filter = ['is_milestone']
    list_editable = ['order']
    search_fields = ['title', 'description']
    
    fieldsets = (
        ('Timeline Event', {
            'fields': ('year', 'title', 'description', 'image')
        }),
        ('Display', {
            'fields': ('is_milestone', 'order')
        }),
    )
    
    def milestone_badge(self, obj):
        if obj.is_milestone:
            return format_html('<span style="background-color: #ff6b35; padding: 5px 10px; border-radius: 3px; color: white;">★ Milestone</span>')
        return '-'
    milestone_badge.short_description = 'Type'


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ['name', 'tier_badge', 'order', 'is_active']
    list_filter = ['tier', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['name', 'description']
    
    fieldsets = (
        ('Sponsor Information', {
            'fields': ('name', 'logo', 'website_url', 'tier', 'description')
        }),
        ('Display', {
            'fields': ('order', 'is_active', 'started_date')
        }),
    )
    
    def tier_badge(self, obj):
        colors = {
            'platinum': '#e5e7eb',
            'gold': '#fbbf24',
            'silver': '#d1d5db',
            'bronze': '#d97706',
            'partner': '#3b82f6',
        }
        return format_html(
            '<span style="background-color: {}; padding: 5px 10px; border-radius: 3px; color: white;">{}</span>',
            colors.get(obj.tier, '#3b82f6'),
            obj.get_tier_display()
        )
    tier_badge.short_description = 'Tier'




@admin.register(LeagueRule)
class LeagueRuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'order', 'is_active']
    list_filter = ['category', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['title', 'content']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'title', 'content')
        }),
        ('Display', {
            'fields': ('order', 'is_active')
        }),
    )


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['name', 'court_type', 'capacity', 'is_primary', 'is_active', 'order']
    list_filter = ['is_active', 'is_primary', 'court_type']
    list_editable = ['is_primary', 'is_active', 'order']
    search_fields = ['name', 'address', 'description']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'address', 'description')
        }),
        ('Court Specifications', {
            'fields': ('court_type', 'court_dimensions', 'surface_type')
        }),
        ('Facilities', {
            'fields': ('facilities', 'capacity')
        }),
        ('Media', {
            'fields': ('featured_image', 'gallery_images')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'map_embed_code'),
            'classes': ('collapse',)
        }),
        ('Contact', {
            'fields': ('phone', 'email', 'website'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_primary', 'order')
        }),
    )


@admin.register(DraftInfo)
class DraftInfoAdmin(admin.ModelAdmin):
    fieldsets = (
        ('General', {
            'fields': ('title', 'overview', 'featured_image')
        }),
        ('Eligibility', {
            'fields': ('eligibility_title', 'eligibility_content')
        }),
        ('Process', {
            'fields': ('process_title', 'process_content')
        }),
        ('Timeline', {
            'fields': ('timeline_title', 'timeline_content', 'registration_deadline', 'draft_date')
        }),
        ('Rules', {
            'fields': ('rules_title', 'rules_content')
        }),
        ('FAQ', {
            'fields': ('faq_title', 'faq_content')
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not DraftInfo.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ManagerInfo)
class ManagerInfoAdmin(admin.ModelAdmin):
    fieldsets = (
        ('General', {
            'fields': ('title', 'overview')
        }),
        ('Responsibilities', {
            'fields': ('responsibilities_title', 'responsibilities_content')
        }),
        ('Requirements', {
            'fields': ('requirements_title', 'requirements_content')
        }),
        ('Benefits', {
            'fields': ('benefits_title', 'benefits_content')
        }),
        ('How to Become', {
            'fields': ('how_to_become_title', 'how_to_become_content')
        }),
        ('Contact', {
            'fields': ('contact_email', 'contact_phone')
        }),
    )
    
    def has_add_permission(self, request):
        return not ManagerInfo.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ['name', 'team_name', 'years_experience', 'is_active', 'order']
    list_filter = ['is_active']
    list_editable = ['is_active', 'order']
    search_fields = ['name', 'team_name', 'bio']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'team_name', 'bio', 'photo')
        }),
        ('Contact', {
            'fields': ('email', 'phone')
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'twitter_url', 'linkedin_url'),
            'classes': ('collapse',)
        }),
        ('Details', {
            'fields': ('years_experience', 'joined_date')
        }),
        ('Display', {
            'fields': ('is_active', 'order')
        }),
    )