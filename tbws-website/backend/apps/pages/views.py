from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
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


# ✅ FIXED - Changed from ReadOnlyModelViewSet to ModelViewSet for full CRUD
class PageViewSet(viewsets.ModelViewSet):
    """ViewSet for pages - FULL CRUD"""
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        # Public can read, admin can do everything
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Admin sees all, public sees only published
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Page.objects.all().order_by('-created_at')
        return Page.objects.filter(status='published').order_by('-created_at')


class SiteSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for site settings"""
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'current']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def current(self, request):
        """Get current site settings"""
        settings = SiteSettings.load()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)


class CoreValueViewSet(viewsets.ModelViewSet):
    """ViewSet for core values - FULL CRUD"""
    queryset = CoreValue.objects.all()
    serializer_class = CoreValueSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Admin sees all, public sees only active
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return CoreValue.objects.all().order_by('order', 'title')
        return CoreValue.objects.filter(is_active=True).order_by('order', 'title')


class TeamMemberViewSet(viewsets.ModelViewSet):
    """ViewSet for team members - FULL CRUD"""
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Admin sees all, public sees only active
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return TeamMember.objects.all().order_by('order', 'name')
        return TeamMember.objects.filter(is_active=True).order_by('order', 'name')


class FAQViewSet(viewsets.ModelViewSet):
    """ViewSet for FAQs - FULL CRUD"""
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Admin sees all, public sees only active
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return FAQ.objects.all().order_by('order', '-created_at')
        return FAQ.objects.filter(is_active=True).order_by('order', '-created_at')


class HistoryTimelineViewSet(viewsets.ModelViewSet):
    """ViewSet for history timeline - FULL CRUD"""
    queryset = HistoryTimeline.objects.all()
    serializer_class = HistoryTimelineSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class SponsorViewSet(viewsets.ModelViewSet):
    """ViewSet for sponsors - FULL CRUD"""
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Admin sees all, public sees only active
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Sponsor.objects.all().order_by('order', 'name')
        return Sponsor.objects.filter(is_active=True).order_by('order', 'name')


class LeagueRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for league rules - FULL CRUD"""
    queryset = LeagueRule.objects.all()
    serializer_class = LeagueRuleSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_category']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Admin sees all, public sees only active
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return LeagueRule.objects.all().order_by('category', 'order', 'title')
        return LeagueRule.objects.filter(is_active=True).order_by('category', 'order', 'title')
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_category(self, request):
        """Get rules grouped by category"""
        categories = {}
        for rule in self.get_queryset():
            cat = rule.get_category_display()
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(LeagueRuleSerializer(rule).data)
        return Response(categories)


class VenueViewSet(viewsets.ModelViewSet):
    """ViewSet for venues - FULL CRUD"""
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'primary']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Admin sees all, public sees only active
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Venue.objects.all().order_by('-is_primary', 'order', 'name')
        return Venue.objects.filter(is_active=True).order_by('-is_primary', 'order', 'name')
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def primary(self, request):
        """Get primary venue"""
        venue = Venue.objects.filter(is_primary=True, is_active=True).first()
        if venue:
            serializer = self.get_serializer(venue)
            return Response(serializer.data)
        return Response(None)


class DraftInfoViewSet(viewsets.ModelViewSet):
    """ViewSet for draft information"""
    queryset = DraftInfo.objects.all()
    serializer_class = DraftInfoSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'current']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def current(self, request):
        """Get current draft info"""
        draft_info = DraftInfo.load()
        serializer = self.get_serializer(draft_info)
        return Response(serializer.data)


class ManagerInfoViewSet(viewsets.ModelViewSet):
    """ViewSet for manager information"""
    queryset = ManagerInfo.objects.all()
    serializer_class = ManagerInfoSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'current']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def current(self, request):
        """Get current manager info"""
        manager_info = ManagerInfo.load()
        serializer = self.get_serializer(manager_info)
        return Response(serializer.data)


class ManagerViewSet(viewsets.ModelViewSet):
    """ViewSet for managers - FULL CRUD"""
    queryset = Manager.objects.all()
    serializer_class = ManagerSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Admin sees all, public sees only active
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Manager.objects.all().order_by('order', 'name')
        return Manager.objects.filter(is_active=True).order_by('order', 'name')