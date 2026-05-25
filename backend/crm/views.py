from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO

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
