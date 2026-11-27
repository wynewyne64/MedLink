# prescriptions/serializers.py
from rest_framework import serializers
from .models import MedicalRecord, Prescription


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = [
            'id', 'medication_name', 'dosage', 'frequency',
            'duration', 'instructions', 'qr_code', 'created_at'
        ]
        read_only_fields = ['id', 'qr_code', 'created_at']


class MedicalRecordSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'doctor', 'appointment',
            'diagnosis', 'treatment', 'notes',
            'prescriptions', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MedicalRecordCreateSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, required=False)

    class Meta:
        model = MedicalRecord
        fields = [
            'patient', 'appointment', 'diagnosis',
            'treatment', 'notes', 'prescriptions'
        ]

    def create(self, validated_data):
        prescriptions_data = validated_data.pop('prescriptions', [])
        doctor = self.context['request'].user.doctor_profile
        record = MedicalRecord.objects.create(doctor=doctor, **validated_data)
        for prescription in prescriptions_data:
            Prescription.objects.create(medical_record=record, **prescription)
        return record