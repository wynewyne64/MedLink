# patients/admin.py
from django.contrib import admin
from .models import Patient
from authentication.models import User


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'get_email', 'gender', 'blood_group', 'get_phone']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'user__phone_number']
    list_filter = ['gender', 'blood_group']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'user':
            # Only show users with role 'patient' in the dropdown
            kwargs['queryset'] = User.objects.filter(role='patient')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Full Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

    def get_phone(self, obj):
        return obj.user.phone_number
    get_phone.short_description = 'Phone'