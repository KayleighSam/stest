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
            'meta_description',
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
            'order'
        ]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
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
            'order'
        ]


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = [
            'id',
            'question',
            'answer',
            'category',
            'order'
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
            'order'
        ]


class SponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = [
            'id',
            'name',
            'logo',
            'website_url',
            'tier',
            'description',
            'order'
        ]

# Serializers for League Rules, Venues, Draft Info, Manager Info, and Managers
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
            'order'
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
            'latitude',
            'longitude',
            'map_embed_code',
            'phone',
            'email',
            'website',
            'is_primary'
        ]


class DraftInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DraftInfo
        fields = [
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
            'featured_image'
        ]


class ManagerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagerInfo
        fields = [
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
            'contact_phone'
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
            'joined_date',
            'order'
        ]