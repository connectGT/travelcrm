import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from crm.models import Tag, RawLead, Trip, FollowUp

class Command(BaseCommand):
    help = 'Seeds the database with dummy CRM data'

    def handle(self, *args, **kwargs):
        # Create a default user if none exists
        user, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com'})
        if not user.is_superuser:
            user.is_superuser = True
            user.is_staff = True
            user.set_password('admin')
            user.save()

        # 1. Tags
        tags_data = [
            ("CNP", "#ef4444"),
            ("Hot Lead", "#f97316"),
            ("VIP", "#8b5cf6"),
            ("B2B", "#3b82f6"),
            ("Follow Up", "#22c55e"),
        ]
        tags = {}
        for name, color in tags_data:
            tag, _ = Tag.objects.get_or_create(name=name, defaults={'color': color})
            tags[name] = tag

        tag_list = list(tags.values())
        self.stdout.write(f"Created {len(tags)} tags.")

        # 2. Raw Leads
        sources = ['WhatsApp', 'Email', 'Web Form', 'Google Ads', 'Facebook Ads']
        destinations = ['Himachal', 'Kerala', 'Rajasthan', 'Goa', 'Kashmir', 'Bali', 'Dubai', 'Maldives']
        indian_names = ['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Sneha Gupta', 'Vikram Patel', 'Neha Verma', 'Rohan Desai', 'Anjali Iyer', 'Rajesh Nair', 'Pooja Reddy']
        
        RawLead.objects.all().delete()
        for i in range(10):
            is_converted = i >= 7  # 7 False, 3 True
            name = indian_names[i]
            dest = random.choice(destinations)
            raw_data = f"Name: {name}, Phone: +91 98765432{i:02d}, Wants to go to {dest} for 5 nights"
            RawLead.objects.create(
                source=random.choice(sources),
                raw_data=raw_data,
                is_converted=is_converted
            )
        self.stdout.write(f"Created 10 Raw Leads.")

        # 3. Trips
        trip_statuses = [
            ('NEW', 2),
            ('IN_PROGRESS', 3),
            ('ON_HOLD', 2),
            ('CONVERTED', 2),
            ('ON_TRIP', 2),
            ('PAST_TRIP', 2),
            ('CANCELLED', 1),
            ('DROPPED', 1)
        ]

        now = timezone.now()
        Trip.objects.all().delete()
        
        trips_created = []

        for status, count in trip_statuses:
            for i in range(count):
                name = random.choice(indian_names)
                dest = random.choice(destinations)
                start_date = now.date() + timedelta(days=random.randint(10, 60))
                end_date = start_date + timedelta(days=5)
                
                trip = Trip.objects.create(
                    primary_contact_name=f"{name} ({status})",
                    phone=f"+91 9876540{random.randint(100,999)}",
                    destination=dest,
                    start_date=start_date,
                    end_date=end_date,
                    no_of_adults=random.randint(2, 4),
                    no_of_nights=5,
                    status=status,
                    assigned_agent=user,
                    comments=f"Sample comment for {status} trip."
                )
                
                # Assign random tags
                trip.tags.set(random.sample(tag_list, random.randint(1, 3)))
                trips_created.append(trip)

        self.stdout.write(f"Created {len(trips_created)} Trips.")

        # 4. FollowUps
        FollowUp.objects.all().delete()
        followup_notes = ["Called, no answer", "Spoke to client - sending quote", "Client asked to call back next week"]
        followups_count = 0
        
        for trip in trips_created:
            if trip.status in ['IN_PROGRESS', 'ON_HOLD']:
                for j in range(random.randint(2, 3)):
                    due_date = now + timedelta(days=random.randint(-2, 5))
                    FollowUp.objects.create(
                        trip=trip,
                        agent=user,
                        due_date=due_date,
                        note=random.choice(followup_notes),
                        is_completed=(due_date < now)
                    )
                    followups_count += 1
                    
        self.stdout.write(f"Created {followups_count} FollowUps.")

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with realistic dummy data!'))
