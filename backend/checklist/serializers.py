from rest_framework import serializers
from .models import Preflight, ChecklistItem

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'preflight', 'checks', 'status', 'comments']


class PreflightSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Preflight
        fields = [
            'flight_number',
            'filed_by',
            'filing_time',
            'departure_location',
            'departure_time',
            'arrival_location',
            'est_arrival_time',
            'created_at',
            'items'
        ]
