from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RawLeadViewSet, TripViewSet, ContactViewSet,
    FollowUpViewSet, QuoteViewSet, QuoteVariantViewSet,
    HotelItemViewSet, TransportItemViewSet, TagViewSet, ItineraryDayViewSet,
    DestinationViewSet
)

router = DefaultRouter()
router.register(r'raw-leads', RawLeadViewSet)
router.register(r'trips', TripViewSet)
router.register(r'contacts', ContactViewSet)
router.register(r'follow-ups', FollowUpViewSet)
router.register(r'quotes', QuoteViewSet)
router.register(r'quote-variants', QuoteVariantViewSet)
router.register(r'hotels', HotelItemViewSet)
router.register(r'transports', TransportItemViewSet)
router.register(r'tags', TagViewSet)
router.register(r'itinerary-days', ItineraryDayViewSet)
router.register(r'destinations', DestinationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
