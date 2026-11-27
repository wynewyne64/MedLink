# doctors/models.py
from django.db import models
from authentication.models import User

class Specialization(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.ForeignKey(Specialization, on_delete=models.SET_NULL, null=True)
    license_number = models.CharField(max_length=50, unique=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)  # Admin approves doctors
    available_for_consultation = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} — {self.specialization}"

class DoctorAvailability(models.Model):
    DAY_CHOICES = [
        (0,'Monday'),(1,'Tuesday'),(2,'Wednesday'),
        (3,'Thursday'),(4,'Friday'),(5,'Saturday'),(6,'Sunday'),
    ]
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ['doctor', 'day_of_week']