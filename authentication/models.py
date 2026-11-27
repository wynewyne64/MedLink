from django.contrib.auth.models import AbstractUser
from django.db import models
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from patients.models import Patient
    from doctors.models import Doctor


class User(AbstractUser):
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone_number = models.CharField(max_length=15, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # These lines tell PyCharm these attributes exist via related_name
    if TYPE_CHECKING:
        patient_profile: 'Patient'
        doctor_profile: 'Doctor'

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"