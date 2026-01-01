from rest_framework import serializers
from .models import (
    Page, SiteSettings, TeamMember, FAQ, HistoryTimeline, 
    Sponsor, CoreValue, LeagueRule, Venue, DraftInfo, 
    ManagerInfo, Manager
)

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = [
            'id',
            'title',
            'slug',
            'subtitle',
            'content',
            'hero_image',
            'featured_image',
            'status',
            'meta_description',
            'meta_keywords',
            'created_at',
            'updated_at'
        ]


class CoreValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreValue
        fields = [
            'id',
            'title',
            'description',
            'icon',
            'color_start',
            'color_end',
            'order',
            'is_active',
            'created_at',
        ]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'id',
            'site_name',
            'tagline',
            'description',
            'about_title',
            'about_content',
            'about_image',
            'hero_image',
            'mission_title',
            'mission_content',
            'vision_title',
            'vision_content',
            'email',
            'phone',
            'address',
            'facebook_url',
            'twitter_url',
            'instagram_url',
            'youtube_url',
            'logo',
            'favicon',
            'meta_description',
            'meta_keywords',
        ]


class TeamMemberSerializer(serializers.ModelSerializer):
    role_display = serializers.ReadOnlyField()
    
    class Meta:
        model = TeamMember
        fields = [
            'id',
            'name',
            'role',
            'role_display',
            'title',
            'bio',
            'photo',
            'email',
            'phone',
            'facebook_url',
            'twitter_url',
            'linkedin_url',
            'order',
            'is_active',
            'joined_date',
            'created_at',
        ]


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = [
            'id',
            'question',
            'answer',
            'category',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]


class HistoryTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryTimeline
        fields = [
            'id',
            'year',
            'title',
            'description',
            'image',
            'is_milestone',
            'order',
            'created_at',
        ]


class SponsorSerializer(serializers.ModelSerializer):
    tier_display = serializers.CharField(source='get_tier_display', read_only=True)
    
    class Meta:
        model = Sponsor
        fields = [
            'id',
            'name',
            'logo',
            'website_url',
            'tier',
            'tier_display',
            'description',
            'order',
            'is_active',
            'started_date',
            'created_at',
        ]


class LeagueRuleSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = LeagueRule
        fields = [
            'id',
            'category',
            'category_display',
            'title',
            'content',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = [
            'id',
            'name',
            'address',
            'description',
            'court_type',
            'court_dimensions',
            'surface_type',
            'facilities',
            'capacity',
            'featured_image',
            'gallery_images',
            'latitude',
            'longitude',
            'map_embed_code',
            'phone',
            'email',
            'website',
            'is_active',
            'is_primary',
            'order',
            'created_at',
        ]


class DraftInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DraftInfo
        fields = [
            'id',
            'title',
            'overview',
            'eligibility_title',
            'eligibility_content',
            'process_title',
            'process_content',
            'timeline_title',
            'timeline_content',
            'rules_title',
            'rules_content',
            'faq_title',
            'faq_content',
            'registration_deadline',
            'draft_date',
            'featured_image',
            'updated_at',
        ]


class ManagerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagerInfo
        fields = [
            'id',
            'title',
            'overview',
            'responsibilities_title',
            'responsibilities_content',
            'requirements_title',
            'requirements_content',
            'benefits_title',
            'benefits_content',
            'how_to_become_title',
            'how_to_become_content',
            'contact_email',
            'contact_phone',
            'updated_at',
        ]


class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = [
            'id',
            'name',
            'team_name',
            'bio',
            'photo',
            'email',
            'phone',
            'facebook_url',
            'twitter_url',
            'linkedin_url',
            'years_experience',
            'is_active',
            'order',
            'joined_date',
            'created_at',
        ]