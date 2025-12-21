from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PageViewSet, SiteSettingsViewSet, TeamMemberViewSet,
    FAQViewSet, HistoryTimelineViewSet, SponsorViewSet, CoreValueViewSet,
    LeagueRuleViewSet, VenueViewSet, DraftInfoViewSet, 
    ManagerInfoViewSet, ManagerViewSet
)

app_name = 'pages'

router = DefaultRouter()
router.register(r'pages', PageViewSet, basename='page')
router.register(r'settings', SiteSettingsViewSet, basename='settings')
router.register(r'core-values', CoreValueViewSet, basename='core-value')
router.register(r'team', TeamMemberViewSet, basename='team')
router.register(r'faq', FAQViewSet, basename='faq')
router.register(r'history', HistoryTimelineViewSet, basename='history')
router.register(r'sponsors', SponsorViewSet, basename='sponsor')
router.register(r'league-rules', LeagueRuleViewSet, basename='league-rule')
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'draft-info', DraftInfoViewSet, basename='draft-info')
router.register(r'manager-info', ManagerInfoViewSet, basename='manager-info')
router.register(r'managers', ManagerViewSet, basename='manager')

urlpatterns = [
    path('', include(router.urls)),
]