from django.test import TestCase
from decimal import Decimal
from .models import Trip, Quote, QuoteVariant, HotelItem, TransportItem
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth.models import User

class PricingEngineTests(TestCase):
    def setUp(self):
        self.trip = Trip.objects.create(primary_contact_name="John Doe", destination="Bali")
        self.quote = Quote.objects.create(trip=self.trip, title="Luxury Bali", adults=2)
        self.variant = QuoteVariant.objects.create(
            quote=self.quote,
            name="5-Star Option",
            markup_percentage=Decimal('10.00'),
            gst_percentage=Decimal('5.00')
        )
        # Add Hotel: $1000 net price
        HotelItem.objects.create(
            variant=self.variant,
            hotel_name="Ritz Carlton",
            check_in="2026-06-01",
            check_out="2026-06-05",
            room_type="Suite",
            rooms_count=1,
            net_price=Decimal('1000.00')
        )
        # Add Transport: $200 net price
        TransportItem.objects.create(
            variant=self.variant,
            transport_type="CAB",
            description="Airport Transfer",
            date="2026-06-01",
            net_price=Decimal('200.00')
        )

    def test_total_net_price(self):
        self.assertEqual(self.variant.total_net_price, Decimal('1200.00'))

    def test_markup_amount(self):
        # 10% of 1200 = 120.00
        self.assertEqual(self.variant.markup_amount, Decimal('120.00'))

    def test_price_before_tax(self):
        # 1200 + 120 = 1320.00
        self.assertEqual(self.variant.price_before_tax, Decimal('1320.00'))

    def test_gst_amount(self):
        # 5% of 1320 = 66.00
        self.assertEqual(self.variant.gst_amount, Decimal('66.00'))

    def test_selling_price(self):
        # 1320 + 66 = 1386.00
        self.assertEqual(self.variant.selling_price, Decimal('1386.00'))


class QuoteAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.trip = Trip.objects.create(primary_contact_name="Jane Doe", destination="Paris")
        self.quote = Quote.objects.create(trip=self.trip, title="Paris Romance", adults=2)
        self.variant = QuoteVariant.objects.create(
            quote=self.quote,
            name="Standard",
            markup_percentage=Decimal('10.00'),
            gst_percentage=Decimal('5.00')
        )

    def test_pdf_generation_endpoint(self):
        url = reverse('quote-pdf', kwargs={'pk': self.quote.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(response.content.startswith(b'%PDF-'))
