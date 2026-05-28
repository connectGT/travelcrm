from rest_framework import serializers
from .models import (
    RawLead, Trip, Contact, FollowUp, Quote, QuoteVariant,
    HotelItem, TransportItem, Tag, ItineraryDay, Destination
)
from django.contrib.auth.models import User
import math


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = ['id', 'city', 'state', 'country', 'iso2', 'lat', 'lng']


class RawLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawLead
        fields = [
            'id', 'source', 'raw_data', 'contact_name', 'phone', 'email',
            'destination', 'start_date', 'end_date', 'no_of_adults', 'no_of_children',
            'received_at', 'is_converted', 'trip', 'status', 'archived_at'
        ]


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'


class FollowUpSerializer(serializers.ModelSerializer):
    agent_details = UserSerializer(source='agent', read_only=True)

    class Meta:
        model = FollowUp
        fields = '__all__'


class HotelItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelItem
        fields = [
            'id', 'variant', 'hotel_name', 'location', 'star_rating',
            'check_in', 'check_out', 'room_type', 'rooms_count',
            'net_price', 'given_price', 'meal_plan',
            'pax_per_room', 'aweb', 'cweb', 'cnb', 'comp_child_max_age'
        ]


class TransportItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportItem
        fields = [
            'id', 'variant', 'transport_type', 'description',
            'service_locations', 'service_type', 'cab_type',
            'date', 'start_time', 'duration_mins', 'net_price'
        ]


class QuoteVariantSerializer(serializers.ModelSerializer):
    hotels = HotelItemSerializer(many=True, read_only=True)
    transports = TransportItemSerializer(many=True, read_only=True)

    class Meta:
        model = QuoteVariant
        fields = [
            'id', 'quote', 'name', 'markup_percentage', 'gst_percentage',
            'hotels', 'transports', 'total_net_price', 'markup_amount',
            'price_before_tax', 'gst_amount', 'selling_price'
        ]


class ItineraryDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryDay
        fields = ['id', 'day_number', 'location', 'activity']


class QuoteSerializer(serializers.ModelSerializer):
    variants = QuoteVariantSerializer(many=True, read_only=True)
    itinerary_days = ItineraryDaySerializer(many=True, read_only=True)
    selling_price_preview = serializers.SerializerMethodField()

    class Meta:
        model = Quote
        fields = [
            'id', 'trip', 'title', 'adults', 'children', 'is_primary',
            'pricing_strategy', 'selling_currency', 'total_foc',
            'markup_percentage', 'agent_commission_percentage', 'round_to',
            'tax_applied_on', 'internal_comments', 'internal_price_comments',
            'remarks_for_customer', 'created_at',
            'variants', 'itinerary_days', 'selling_price_preview'
        ]

    def get_selling_price_preview(self, obj):
        try:
            hotels_total = sum(
                float(h.given_price or h.net_price)
                for v in obj.variants.all()
                for h in v.hotels.all()
            )
            transports_total = sum(
                float(t.net_price)
                for v in obj.variants.all()
                for t in v.transports.all()
            )
            cost = hotels_total + transports_total
            markup_pct = float(obj.markup_percentage or 15)
            commission_pct = float(obj.agent_commission_percentage or 5)
            markup_amt = cost * (markup_pct / 100)
            price_before_tax = cost + markup_amt
            commission_amt = price_before_tax * (commission_pct / 100)
            raw_total = price_before_tax + commission_amt
            round_to = obj.round_to or 5
            if round_to == 0:
                round_to = 1  # prevent divide by zero
            rounded = math.ceil(raw_total / round_to) * round_to
            return {
                'cost': round(cost, 2),
                'hotels_total': round(hotels_total, 2),
                'transports_total': round(transports_total, 2),
                'markup_amount': round(markup_amt, 2),
                'commission_amount': round(commission_amt, 2),
                'raw_total': round(raw_total, 2),
                'rounded_total': rounded,
            }
        except Exception:
            return None


class TripSerializer(serializers.ModelSerializer):
    companions = ContactSerializer(many=True, read_only=True)
    follow_ups = FollowUpSerializer(many=True, read_only=True)
    quotes = QuoteSerializer(many=True, read_only=True)
    assigned_agent_details = UserSerializer(source='assigned_agent', read_only=True)
    tags_details = TagSerializer(source='tags', many=True, read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'primary_contact_name', 'email', 'phone', 'origin', 'destination',
            'start_date', 'end_date', 'status', 'assigned_agent', 'assigned_agent_details',
            'tags', 'tags_details', 'due_date',
            'reference_id', 'no_of_nights', 'no_of_adults', 'no_of_children',
            'children_ages', 'total_foc', 'salutation', 'comments',
            'created_at', 'updated_at', 'companions', 'follow_ups', 'quotes'
        ]
