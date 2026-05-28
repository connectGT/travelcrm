from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from crm.models import RawLead


class Command(BaseCommand):
    help = 'Delete archived leads older than 30 days'

    def handle(self, *args, **kwargs):
        cutoff = timezone.now() - timedelta(days=30)
        deleted, _ = RawLead.objects.filter(
            status='ARCHIVED',
            archived_at__lt=cutoff
        ).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} archived leads older than 30 days'))
