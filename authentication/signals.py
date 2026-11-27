from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create Patient or Doctor profile when a new user registers"""
    if created:  # Only runs on new user creation, not updates
        if instance.role == 'patient':
            from patients.models import Patient
            Patient.objects.create(user=instance)

        elif instance.role == 'doctor':
            from doctors.models import Doctor
            Doctor.objects.create(
                user=instance,
                license_number=f'TEMP-{instance.id}',  # Temporary — doctor updates this later
                consultation_fee=0.00
            )