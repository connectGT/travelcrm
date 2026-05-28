from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO

from .models import RawLead, Trip, Contact, FollowUp, Quote, QuoteVariant, HotelItem, TransportItem, Tag
from .serializers import (
    RawLeadSerializer, TripSerializer, ContactSerializer,
    FollowUpSerializer, QuoteSerializer, QuoteVariantSerializer,
    HotelItemSerializer, TransportItemSerializer, TagSerializer
)

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class RawLeadViewSet(viewsets.ModelViewSet):
    queryset = RawLead.objects.all().order_by('-received_at')
    serializer_class = RawLeadSerializer

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        lead = self.get_object()
        if lead.is_converted:
            return Response({'error': 'Lead already converted'}, status=400)
            
        trip_data = request.data.copy()
        trip_data['status'] = 'NEW'
        
        trip_serializer = TripSerializer(data=trip_data)
        if trip_serializer.is_valid():
            trip = trip_serializer.save()
            lead.trip = trip
            lead.is_converted = True
            lead.save()
            return Response(trip_serializer.data, status=201)
        else:
            return Response(trip_serializer.errors, status=400)

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-created_at')
    serializer_class = TripSerializer

    @action(detail=True, methods=['post'])
    def followups(self, request, pk=None):
        trip = self.get_object()
        
        tags = request.data.get('tags')
        note = request.data.get('note')
        due_date = request.data.get('due_date')
        
        if tags is not None:
            trip.tags.set(tags)
            
        if due_date:
            trip.due_date = due_date
            trip.save()
            
        if note and due_date:
            FollowUp.objects.create(
                trip=trip,
                agent=request.user if request.user.is_authenticated else None,
                due_date=due_date,
                note=note
            )
            
        return Response(self.get_serializer(trip).data)

    @action(detail=True, methods=['patch'])
    def assign(self, request, pk=None):
        trip = self.get_object()
        agent_id = request.data.get('agent_id')
        if agent_id is not None:
            trip.assigned_agent_id = agent_id
            trip.save()
            return Response(self.get_serializer(trip).data)
        return Response({'error': 'agent_id is required'}, status=400)

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        trip = self.get_object()
        trip.status = 'ARCHIVED'
        trip.save()
        return Response(self.get_serializer(trip).data)

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all().order_by('due_date')
    serializer_class = FollowUpSerializer

class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all().order_by('-created_at')
    serializer_class = QuoteSerializer

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        quote = self.get_object()
        template = get_template('crm/pdf_itinerary.html')
        html = template.render({'quote': quote})
        
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
        
        if not pdf.err:
            response = HttpResponse(result.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="quote_{quote.id}.pdf"'
            return response
        return Response({'error': 'Failed to generate PDF'}, status=500)

class QuoteVariantViewSet(viewsets.ModelViewSet):
    queryset = QuoteVariant.objects.all()
    serializer_class = QuoteVariantSerializer

class HotelItemViewSet(viewsets.ModelViewSet):
    queryset = HotelItem.objects.all()
    serializer_class = HotelItemSerializer

class TransportItemViewSet(viewsets.ModelViewSet):
    queryset = TransportItem.objects.all()
    serializer_class = TransportItemSerializer
