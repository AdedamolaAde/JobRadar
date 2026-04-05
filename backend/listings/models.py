from django.db import models

class Job(models.Model):
    site = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    company_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    is_remote = models.BooleanField(default=False)
    job_type = models.CharField(max_length=100, blank=True, null=True)
    job_function = models.CharField(max_length=255, blank=True, null=True)
    date_posted = models.DateField(blank=True, null=True)
    min_amount = models.FloatField(blank=True, null=True)
    max_amount = models.FloatField(blank=True, null=True)
    currency = models.CharField(max_length=10, blank=True, null=True)
    job_url = models.URLField(max_length=1000, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    date_scraped = models.DateTimeField(auto_now_add=True)
    company_rating = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} at {self.company}"


class ScrapeLog(models.Model):
    scraped_at = models.DateTimeField(auto_now_add=True)
    jobs_saved = models.IntegerField(default=0)
    # NEW: total rows jobspy returned before any deduplication
    jobs_attempted = models.IntegerField(default=0)
    # NEW: how many rows were skipped because their URL already existed
    duplicates_skipped = models.IntegerField(default=0)
    # NEW: which site(s) were targeted in this run
    source = models.CharField(max_length=100, default="all")

    def __str__(self):
        return f"Scrape at {self.scraped_at} — {self.jobs_saved} jobs"