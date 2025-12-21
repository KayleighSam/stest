from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import (
    Page, SiteSettings, TeamMember, FAQ, HistoryTimeline, 
    Sponsor, CoreValue, LeagueRule, Venue, DraftInfo, 
    ManagerInfo, Manager
)
from .serializers import (
    PageSerializer, SiteSettingsSerializer, TeamMemberSerializer,
    FAQSerializer, HistoryTimelineSerializer, SponsorSerializer,
    CoreValueSerializer, LeagueRuleSerializer, VenueSerializer,
    DraftInfoSerializer, ManagerInfoSerializer, ManagerSerializer
)

class PageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing pages"""
    queryset = Page.objects.filter(status='published')
    serializer_class = PageSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class SiteSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for site settings"""
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current site settings"""
        settings = SiteSettings.load()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)


class CoreValueViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for core values"""
    queryset = CoreValue.objects.filter(is_active=True)
    serializer_class = CoreValueSerializer
    permission_classes = [AllowAny]


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for team members"""
    queryset = TeamMember.objects.filter(is_active=True)
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for FAQs"""
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]


class HistoryTimelineViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for history timeline"""
    queryset = HistoryTimeline.objects.all()
    serializer_class = HistoryTimelineSerializer
    permission_classes = [AllowAny]


class SponsorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for sponsors"""
    queryset = Sponsor.objects.filter(is_active=True)
    serializer_class = SponsorSerializer
    permission_classes = [AllowAny]






class LeagueRuleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for league rules"""
    queryset = LeagueRule.objects.filter(is_active=True)
    serializer_class = LeagueRuleSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get rules grouped by category"""
        categories = {}
        for rule in self.get_queryset():
            cat = rule.get_category_display()
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(LeagueRuleSerializer(rule).data)
        return Response(categories)


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for venues"""
    queryset = Venue.objects.filter(is_active=True)
    serializer_class = VenueSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def primary(self, request):
        """Get primary venue"""
        venue = Venue.objects.filter(is_primary=True, is_active=True).first()
        if venue:
            serializer = self.get_serializer(venue)
            return Response(serializer.data)
        return Response(None)


class DraftInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for draft information"""
    queryset = DraftInfo.objects.all()
    serializer_class = DraftInfoSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current draft info"""
        draft_info = DraftInfo.load()
        serializer = self.get_serializer(draft_info)
        return Response(serializer.data)


class ManagerInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for manager information"""
    queryset = ManagerInfo.objects.all()
    serializer_class = ManagerInfoSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current manager info"""
        manager_info = ManagerInfo.load()
        serializer = self.get_serializer(manager_info)
        return Response(serializer.data)


class ManagerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managers"""
    queryset = Manager.objects.filter(is_active=True)
    serializer_class = ManagerSerializer
    permission_classes = [AllowAny]