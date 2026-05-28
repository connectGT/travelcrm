from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO

from .models import RawLead, Trip, Contact, FollowUp, Quote, QuoteVariant, HotelItem, TransportItem, Tag, ItineraryDay, Destination
from .serializers import (
    RawLeadSerializer, TripSerializer, ContactSerializer,
    FollowUpSerializer, QuoteSerializer, QuoteVariantSerializer,
    HotelItemSerializer, TransportItemSerializer, TagSerializer,
    ItineraryDaySerializer, DestinationSerializer
)

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class RawLeadViewSet(viewsets.ModelViewSet):
    queryset = RawLead.objects.all().order_by('-received_at')
    serializer_class = RawLeadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status', None)
        if status is not None:
            queryset = queryset.filter(status=status)
        return queryset

    @action(detail=True, methods=['patch'])
    def mark_seen(self, request, pk=None):
        lead = self.get_object()
        lead.status = 'SEEN'
        lead.save()
        return Response(self.get_serializer(lead).data)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        from django.utils import timezone
        lead = self.get_object()
        lead.status = 'ARCHIVED'
        lead.archived_at = timezone.now()
        lead.save()
        return Response({'status': 'archived', 'id': lead.id})

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        lead = self.get_object()
        if lead.is_converted:
            return Response({'error': 'Lead already converted'}, status=400)

        raw = request.data

        # Map frontend field names → TripSerializer field names
        trip_data = {
            'status': 'NEW',
            'primary_contact_name': raw.get('guest_name') or raw.get('primary_contact_name', ''),
            'phone': raw.get('guest_phone') or raw.get('phone', ''),
            'email': raw.get('email', ''),
            'salutation': raw.get('salutation', ''),
            'destination': raw.get('destinations') or raw.get('destination', ''),
            'start_date': raw.get('start_date') or None,
            'no_of_nights': raw.get('nights') or raw.get('no_of_nights', 0),
            'no_of_adults': raw.get('adults') or raw.get('no_of_adults', 2),
            'no_of_children': raw.get('no_of_children', 0),
            'children_ages': raw.get('children_ages', ''),
            'total_foc': raw.get('foc') or raw.get('total_foc', 0),
            'comments': raw.get('notes') or raw.get('comments', ''),
            'reference_id': raw.get('reference_id', ''),
            'tags': raw.get('tags', []),
        }

        # Assign agent if provided
        if raw.get('sales_team_id'):
            trip_data['assigned_agent'] = raw.get('sales_team_id')

        trip_serializer = TripSerializer(data=trip_data)
        if trip_serializer.is_valid():
            trip = trip_serializer.save()
            lead.trip = trip
            lead.is_converted = True
            lead.status = 'DONE'
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

    @action(detail=True, methods=['get'])
    def suggested_quotes(self, request, pk=None):
        from django.db.models import Q, Case, When, IntegerField, Value
        from .models import Destination

        trip = self.get_object()
        destination = (trip.destination or '').strip()
        nights = trip.no_of_nights or 0

        if not destination:
            return Response([])

        # Look up the destination city in Destination table to find its state
        dest_obj = Destination.objects.filter(city__iexact=destination).first()
        if not dest_obj:
            dest_obj = Destination.objects.filter(city__icontains=destination.split()[0]).first()
        state = dest_obj.state if dest_obj else None

        # Get all cities in the same state for broader matching
        if state:
            state_cities = list(
                Destination.objects.filter(state__iexact=state)
                .values_list('city', flat=True)
            )
        else:
            state_cities = [destination]

        # Exact city match OR any city in same state
        dest_filter = Q(destination__iexact=destination) | Q(destination__in=state_cities)

        matching_trips = Trip.objects.exclude(id=trip.id).filter(
            dest_filter,
            no_of_nights__gte=max(0, nights - 2),
            no_of_nights__lte=nights + 2,
        ).annotate(
            priority=Case(
                When(destination__iexact=destination, then=Value(0)),  # exact first
                When(no_of_nights=nights, then=Value(1)),              # same nights second
                default=Value(2),
                output_field=IntegerField()
            )
        ).order_by('priority', '-created_at').prefetch_related(
            'quotes__itinerary_days',
            'quotes__variants__hotels',
            'quotes__variants__transports'
        )[:5]

        result = []
        for t in matching_trips:
            quotes = t.quotes.all()
            if quotes.exists():
                result.append({
                    'trip_id': t.id,
                    'client_name': t.primary_contact_name,
                    'destination': t.destination,
                    'matched_state': state,
                    'no_of_nights': t.no_of_nights,
                    'no_of_adults': t.no_of_adults,
                    'quotes': QuoteSerializer(quotes, many=True, context={'request': request}).data
                })

        return Response(result)

    @action(detail=True, methods=['post'], url_path='clone-quote/(?P<quote_id>[^/.]+)')
    def clone_quote(self, request, pk=None, quote_id=None):
        trip = self.get_object()
        try:
            source_quote = Quote.objects.get(id=quote_id)
        except Quote.DoesNotExist:
            return Response({'error': 'Quote not found'}, status=404)
        
        new_quote = Quote.objects.create(
            trip=trip,
            title=f"[From Template] {source_quote.title}",
            adults=trip.no_of_adults,
            children=trip.no_of_children,
            is_primary=False,
            pricing_strategy=source_quote.pricing_strategy,
            selling_currency=source_quote.selling_currency,
            markup_percentage=source_quote.markup_percentage,
            agent_commission_percentage=source_quote.agent_commission_percentage,
            round_to=source_quote.round_to,
            tax_applied_on=source_quote.tax_applied_on,
        )
        
        for day in source_quote.itinerary_days.all():
            ItineraryDay.objects.create(
                quote=new_quote,
                day_number=day.day_number,
                location=day.location,
                activity=day.activity
            )
        
        for variant in source_quote.variants.all():
            new_variant = QuoteVariant.objects.create(
                quote=new_quote,
                name=variant.name,
                markup_percentage=variant.markup_percentage,
                gst_percentage=variant.gst_percentage
            )
            for hotel in variant.hotels.all():
                HotelItem.objects.create(
                    variant=new_variant,
                    hotel_name=hotel.hotel_name,
                    location=hotel.location,
                    star_rating=hotel.star_rating,
                    check_in=hotel.check_in,
                    check_out=hotel.check_out,
                    room_type=hotel.room_type,
                    rooms_count=hotel.rooms_count,
                    net_price=hotel.net_price,
                    given_price=hotel.given_price,
                    meal_plan=hotel.meal_plan,
                    pax_per_room=hotel.pax_per_room,
                    aweb=hotel.aweb,
                    cweb=hotel.cweb,
                    cnb=hotel.cnb,
                    comp_child_max_age=hotel.comp_child_max_age,
                )
            for transport in variant.transports.all():
                TransportItem.objects.create(
                    variant=new_variant,
                    transport_type=transport.transport_type,
                    description=transport.description,
                    service_locations=transport.service_locations,
                    service_type=transport.service_type,
                    cab_type=transport.cab_type,
                    date=transport.date,
                    start_time=transport.start_time,
                    duration_mins=transport.duration_mins,
                    net_price=transport.net_price,
                )
        
        return Response(QuoteSerializer(new_quote, context={'request': request}).data, status=201)

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all().order_by('due_date')
    serializer_class = FollowUpSerializer

class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all().order_by('-created_at')
    serializer_class = QuoteSerializer

    @action(detail=True, methods=['post'], url_path='save')
    def save_quote(self, request, pk=None):
        quote = self.get_object()
        data = request.data

        quote_fields = [
            'pricing_strategy', 'selling_currency', 'total_foc',
            'markup_percentage', 'agent_commission_percentage', 'round_to',
            'tax_applied_on', 'internal_comments', 'internal_price_comments',
            'remarks_for_customer'
        ]
        for field in quote_fields:
            if field in data:
                setattr(quote, field, data[field])
        quote.save()

        if 'hotels' in data:
            variant = quote.variants.first()
            if not variant:
                variant = QuoteVariant.objects.create(quote=quote, name='Option A')
            
            variant.hotels.all().delete()
            for h in data['hotels']:
                HotelItem.objects.create(
                    variant=variant,
                    hotel_name=h.get('name', ''),
                    location=h.get('location', ''),
                    star_rating=h.get('star_rating', 3),
                    check_in=h.get('check_in') or '2026-01-01',
                    check_out=h.get('check_out') or '2026-01-02',
                    room_type=h.get('room_type', ''),
                    rooms_count=h.get('rooms', 1),
                    net_price=h.get('net_price', 0),
                    given_price=h.get('given_price', 0),
                    meal_plan=h.get('meal_plan', 'CP'),
                    pax_per_room=h.get('pax_per_room', 2),
                    aweb=h.get('aweb', 0),
                    cweb=h.get('cweb', 0),
                    cnb=h.get('cnb', 0),
                    comp_child_max_age=h.get('comp_child_max_age', 5),
                )

        if 'transports' in data:
            variant = quote.variants.first()
            if not variant:
                variant = QuoteVariant.objects.create(quote=quote, name='Option A')
            
            variant.transports.all().delete()
            for t in data['transports']:
                TransportItem.objects.create(
                    variant=variant,
                    transport_type='CAB',
                    description=t.get('location', ''),
                    service_locations=t.get('location', ''),
                    service_type=t.get('service_type', 'Transfer'),
                    cab_type=t.get('cab_type', ''),
                    start_time=t.get('start_time') or None,
                    duration_mins=t.get('duration', 60),
                    net_price=t.get('net_price', 0),
                )

        return Response(QuoteSerializer(quote, context={'request': request}).data)

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

class ItineraryDayViewSet(viewsets.ModelViewSet):
    queryset = ItineraryDay.objects.all().order_by('day_number')
    serializer_class = ItineraryDaySerializer


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer

    @action(detail=False, methods=['get'])
    def autocomplete(self, request):
        q = request.query_params.get('q', '').strip()
        if len(q) < 2:
            return Response([])
        results = Destination.objects.filter(
            city__icontains=q
        ).values('city', 'state', 'country', 'iso2')[:10]
        return Response(list(results))
