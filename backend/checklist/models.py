from django.db import models

class Preflight(models.Model):
    # PRIMARY KEY
    flight_number = models.CharField(primary_key=True, max_length=100)

    filed_by = models.CharField(max_length=100, blank=True)
    filing_time = models.CharField(max_length=100, blank=True)
    departure_location = models.CharField(max_length=100, blank=True)
    departure_time = models.CharField(max_length=100, blank=True)
    arrival_location = models.CharField(max_length=100, blank=True)
    est_arrival_time = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.flight_number


class ChecklistItem(models.Model):
    # foreign key -> flight_number
    preflight = models.ForeignKey(
        Preflight,
        to_field="flight_number",
        db_column="flight_number",
        related_name="items",
        on_delete=models.CASCADE
    )

    checks = models.CharField(max_length=300)
    status = models.CharField(max_length=20, choices=(('pending','Pending'),('completed','Completed')), default='pending')
    comments = models.TextField(blank=True)

    def __str__(self):
        return f"{self.checks} ({self.status})"
