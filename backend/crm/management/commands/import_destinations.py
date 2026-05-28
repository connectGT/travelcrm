import csv, os
from django.core.management.base import BaseCommand
from crm.models import Destination

class Command(BaseCommand):
    help = 'Import destinations from Indian Cities and World Cities CSVs'

    def handle(self, *args, **kwargs):
        Destination.objects.all().delete()
        base = os.path.join(os.path.dirname(__file__), '..', '..', 'fixtures')
        count = 0

        # Indian Cities CSV
        with open(os.path.join(base, 'Indian Cities Database.csv'), encoding='utf-8') as f:
            for row in csv.DictReader(f):
                city = row.get('City', '').strip()
                state = row.get('State', '').strip()
                if city:
                    Destination.objects.get_or_create(
                        city__iexact=city,
                        country='India',
                        defaults={
                            'city': city,
                            'state': state,
                            'country': 'India',
                            'iso2': 'IN',
                            'lat': float(row.get('Lat') or 0) or None,
                            'lng': float(row.get('Long') or 0) or None,
                        }
                    )
                    count += 1

        # World Cities CSV — import top cities only (population > 300,000 to keep manageable)
        with open(os.path.join(base, 'worldcities.csv'), encoding='utf-8') as f:
            for row in csv.DictReader(f):
                city = row.get('city_ascii', '').strip()
                country = row.get('country', '').strip()
                iso2 = row.get('iso2', '').strip()
                state = row.get('admin_name', '').strip()
                pop_str = row.get('population', '').strip()
                if iso2 == 'IN':  # Skip Indian cities (already imported)
                    continue
                try:
                    pop = float(pop_str) if pop_str else 0
                except:
                    pop = 0
                if pop < 300000 and country not in ['Maldives', 'Bhutan', 'Nepal', 'Sri Lanka']:
                    continue  # Only import large cities or popular travel destinations
                if city:
                    Destination.objects.get_or_create(
                        city__iexact=city,
                        country=country,
                        defaults={
                            'city': city,
                            'state': state,
                            'country': country,
                            'iso2': iso2,
                            'lat': float(row.get('lat') or 0) or None,
                            'lng': float(row.get('lng') or 0) or None,
                        }
                    )
                    count += 1

        self.stdout.write(self.style.SUCCESS(f'Imported {count} destinations'))
