from django.core.management.base import BaseCommand
from listings.scraper import run_scrape

class Command(BaseCommand):
    help = 'Scrape job listings and save to database'

    def handle(self, *args, **kwargs):
        count = run_scrape()
        self.stdout.write(f"Done. {count} new jobs saved.")