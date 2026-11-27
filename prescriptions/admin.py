# prescriptions/admin.py
from django.contrib import admin
from .models import MedicalRecord, Prescription


class PrescriptionInline(admin.TabularInline):
    """Show prescriptions inside the Medical Record page"""
    model = Prescription
    extra = 1


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_patient', 'get_doctor', 'diagnosis', 'created_at']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'diagnosis']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
    inlines = [PrescriptionInline]

    def get_patient(self, obj):
        return obj.patient.user.get_full_name()
    get_patient.short_description = 'Patient'

    def get_doctor(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}"
    get_doctor.short_description = 'Doctor'


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['medication_name', 'dosage', 'frequency', 'duration', 'get_patient', 'created_at']
    search_fields = ['medication_name', 'medical_record__patient__user__first_name']

    def get_patient(self, obj):
        return obj.medical_record.patient.user.get_full_name()
    get_patient.short_description = 'Patient'