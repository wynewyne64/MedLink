# appointments/serializers.py
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorListSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor = DoctorListSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'appointment_date', 'appointment_time',
            'status', 'consultation_type', 'meeting_link',
            'patient_notes', 'doctor_notes', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'meeting_link', 'created_at']


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'doctor', 'appointment_date', 'appointment_time',
            'consultation_type', 'patient_notes'
        ]

    def validate(self, attrs):
        doctor = attrs['doctor']
        date = attrs['appointment_date']
        time = attrs['appointment_time']
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date,
            appointment_time=time,
            status__in=['pending', 'confirmed']
        ).exists():
            raise serializers.ValidationError(
                'This doctor already has an appointment at that date and time.'
            )
        return attrs

    def create(self, validated_data):
        patient = self.context['request'].user.patient_profile
        return Appointment.objects.create(patient=patient, **validated_data)


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status', 'meeting_link', 'doctor_notes']