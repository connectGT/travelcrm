from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=20, default="#000000")

    def __str__(self):
        return self.name

class RawLead(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('SEEN', 'Seen'),
        ('DONE', 'Done'),
    ]
    source = models.CharField(max_length=100, help_text="e.g., WhatsApp, Email, Web Form")
    raw_data = models.TextField(help_text="The raw query text")
    
    # Structured Contact Fields
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    destination = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    no_of_adults = models.PositiveIntegerField(default=2)
    no_of_children = models.PositiveIntegerField(default=0)
    
    received_at = models.DateTimeField(auto_now_add=True)
    is_converted = models.BooleanField(default=False)
    trip = models.ForeignKey('Trip', on_delete=models.SET_NULL, null=True, blank=True, related_name='raw_leads')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='NEW')

    def __str__(self):
        return f"Lead from {self.source} at {self.received_at}"

class Trip(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('IN_PROGRESS', 'In progress'),
        ('ON_HOLD', 'On hold'),
        ('CONVERTED', 'Converted'),
        ('ON_TRIP', 'On trip'),
        ('PAST_TRIP', 'Past trips'),
        ('CANCELLED', 'Cancelled'),
        ('DROPPED', 'Dropped'),
        ('ARCHIVED', 'Archived'),
    ]

    primary_contact_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50)
    origin = models.CharField(max_length=255, blank=True, null=True)
    destination = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    no_of_nights = models.PositiveIntegerField(default=0)
    no_of_adults = models.PositiveIntegerField(default=2)
    no_of_children = models.PositiveIntegerField(default=0)
    children_ages = models.CharField(max_length=100, blank=True, null=True)
    total_foc = models.PositiveIntegerField(default=0)
    salutation = models.CharField(max_length=20, blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    assigned_agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField(Tag, related_name='trips', blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.primary_contact_name} - {self.destination}"

class Contact(models.Model):
    trip = models.ForeignKey(Trip, related_name='companions', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    relation = models.CharField(max_length=100, blank=True, null=True)
    passport_info = models.CharField(max_length=255, blank=True, null=True)
    dietary_preferences = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class FollowUp(models.Model):
    trip = models.ForeignKey(Trip, related_name='follow_ups', on_delete=models.CASCADE)
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateTimeField()
    note = models.CharField(max_length=500)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Follow up for {self.trip} on {self.due_date}"

class Quote(models.Model):
    trip = models.ForeignKey(Trip, related_name='quotes', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    adults = models.PositiveIntegerField(default=1)
    children = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} for {self.trip}"

class QuoteVariant(models.Model):
    quote = models.ForeignKey(Quote, related_name='variants', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, help_text="e.g., Option A, 3-Star Option")
    markup_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.0) # Standard India GST for tours
    
    def __str__(self):
        return f"{self.quote.title} - {self.name}"

    @property
    def total_net_price(self):
        hotels_total = sum(item.net_price for item in self.hotels.all())
        transports_total = sum(item.net_price for item in self.transports.all())
        return hotels_total + transports_total

    @property
    def markup_amount(self):
        return self.total_net_price * (self.markup_percentage / 100)

    @property
    def price_before_tax(self):
        return self.total_net_price + self.markup_amount

    @property
    def gst_amount(self):
        return self.price_before_tax * (self.gst_percentage / 100)

    @property
    def selling_price(self):
        return self.price_before_tax + self.gst_amount

class HotelItem(models.Model):
    variant = models.ForeignKey(QuoteVariant, related_name='hotels', on_delete=models.CASCADE)
    hotel_name = models.CharField(max_length=255)
    check_in = models.DateField()
    check_out = models.DateField()
    room_type = models.CharField(max_length=255)
    rooms_count = models.PositiveIntegerField(default=1)
    net_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.hotel_name} ({self.variant.name})"

class TransportItem(models.Model):
    TRANSPORT_TYPES = [
        ('FLIGHT', 'Flight'),
        ('CAB', 'Cab/Transfer'),
        ('ACTIVITY', 'Activity/Sightseeing'),
        ('TRAIN', 'Train'),
    ]
    variant = models.ForeignKey(QuoteVariant, related_name='transports', on_delete=models.CASCADE)
    transport_type = models.CharField(max_length=20, choices=TRANSPORT_TYPES)
    description = models.TextField()
    date = models.DateField()
    net_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.transport_type} on {self.date}"
