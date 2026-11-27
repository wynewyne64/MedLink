from rest_framework import serializers
from .models import Patient
from authentication.serializers import UserSerializer


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'date_of_birth', 'gender', 'blood_group',
            'address', 'insurance_provider', 'insurance_number',
            'allergies', 'emergency_contact_name', 'emergency_contact_phone'
        ]


class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'date_of_birth', 'gender', 'blood_group', 'address',
            'insurance_provider', 'insurance_number', 'allergies',
            'emergency_contact_name', 'emergency_contact_phone'
        ]