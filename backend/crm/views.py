from rest_framework import viewsets
from .models import RawLead, Trip, Contact, FollowUp, Quote, QuoteVariant, HotelItem, TransportItem
from .serializers import (
    RawLeadSerializer, TripSerializer, ContactSerializer,
    FollowUpSerializer, QuoteSerializer, QuoteVariantSerializer,
    HotelItemSerializer, TransportItemSerializer
)

class RawLeadViewSet(viewsets.ModelViewSet):
    queryset = RawLead.objects.all().order_by('-received_at')
    serializer_class = RawLeadSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-created_at')
    serializer_class = TripSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all().order_by('scheduled_date')
    serializer_class = FollowUpSerializer

class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all().order_by('-created_at')
    serializer_class = QuoteSerializer

class QuoteVariantViewSet(viewsets.ModelViewSet):
    queryset = QuoteVariant.objects.all()
    serializer_class = QuoteVariantSerializer

class HotelItemViewSet(viewsets.ModelViewSet):
    queryset = HotelItem.objects.all()
    serializer_class = HotelItemSerializer

class TransportItemViewSet(viewsets.ModelViewSet):
    queryset = TransportItem.objects.all()
    serializer_class = TransportItemSerializer
