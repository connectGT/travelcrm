from rest_framework import serializers
from .models import RawLead, Trip, Contact, FollowUp, Quote, QuoteVariant, HotelItem, TransportItem
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class RawLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawLead
        fields = '__all__'

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = '__all__'

class HotelItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelItem
        fields = '__all__'

class TransportItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportItem
        fields = '__all__'

class QuoteVariantSerializer(serializers.ModelSerializer):
    hotels = HotelItemSerializer(many=True, read_only=True)
    transports = TransportItemSerializer(many=True, read_only=True)

    class Meta:
        model = QuoteVariant
        fields = ['id', 'quote', 'name', 'markup_percentage', 'gst_percentage', 'hotels', 'transports']

class QuoteSerializer(serializers.ModelSerializer):
    variants = QuoteVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Quote
        fields = ['id', 'trip', 'title', 'adults', 'children', 'is_primary', 'created_at', 'variants']

class TripSerializer(serializers.ModelSerializer):
    companions = ContactSerializer(many=True, read_only=True)
    follow_ups = FollowUpSerializer(many=True, read_only=True)
    quotes = QuoteSerializer(many=True, read_only=True)
    assigned_agent_details = UserSerializer(source='assigned_agent', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'primary_contact_name', 'email', 'phone', 'origin', 'destination', 
            'start_date', 'end_date', 'status', 'assigned_agent', 'assigned_agent_details',
            'created_at', 'updated_at', 'companions', 'follow_ups', 'quotes'
        ]
