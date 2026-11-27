# doctors/admin.py
from django.contrib import admin
from .models import Doctor, Specialization, DoctorAvailability
from authentication.models import User


@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


class DoctorAvailabilityInline(admin.TabularInline):
    model = DoctorAvailability
    extra = 1


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'specialization', 'license_number', 'consultation_fee', 'is_verified', 'available_for_consultation']
    list_filter = ['is_verified', 'available_for_consultation', 'specialization']
    search_fields = ['user__first_name', 'user__last_name', 'license_number']
    list_editable = ['is_verified', 'available_for_consultation']
    inlines = [DoctorAvailabilityInline]

    # Remove readonly_fields for user — let admin select it
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'user':
            # Only show users with role 'doctor' in the dropdown
            kwargs['queryset'] = User.objects.filter(role='doctor')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_full_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"
    get_full_name.short_description = 'Doctor'

    actions = ['verify_doctors', 'unverify_doctors']

    def verify_doctors(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, f'{queryset.count()} doctor(s) verified successfully.')
    verify_doctors.short_description = 'Verify selected doctors'

    def unverify_doctors(self, request, queryset):
        queryset.update(is_verified=False)
        self.message_user(request, f'{queryset.count()} doctor(s) unverified.')
    unverify_doctors.short_description = 'Unverify selected doctors'