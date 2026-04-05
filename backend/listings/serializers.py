from rest_framework import serializers
# FIXED: was referencing JobListing which does not exist; corrected to Job
from listings.models import Job, ScrapeLog


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'


# NEW: serializer for ScrapeLog, used by the scraper health tab endpoints
class ScrapeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrapeLog
        fields = '__all__'