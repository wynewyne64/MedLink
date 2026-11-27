from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_patient', 'get_doctor', 'appointment_date', 'appointment_time', 'status', 'consultation_type']
    list_filter = ['status', 'consultation_type', 'appointment_date']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'doctor__user__first_name']
    ordering = ['-appointment_date', '-appointment_time']
    list_editable = ['status']
    readonly_fields = ['created_at']

    def get_patient(self, obj):
        return obj.patient.user.get_full_name()
    get_patient.short_description = 'Patient'

    def get_doctor(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}"
    get_doctor.short_description = 'Doctor'