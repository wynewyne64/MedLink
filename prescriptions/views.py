# prescriptions/views.py
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from .models import MedicalRecord, Prescription
from .serializers import MedicalRecordSerializer, MedicalRecordCreateSerializer


class MedicalRecordCreateView(generics.CreateAPIView):
    """Doctor creates a medical record"""
    permission_classes = [IsAuthenticated]
    serializer_class = MedicalRecordCreateSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class PatientMedicalRecordListView(generics.ListAPIView):
    """Patient views their medical history"""
    permission_classes = [IsAuthenticated]
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        return MedicalRecord.objects.filter(
            patient=self.request.user.patient_profile
        )


class MedicalRecordDetailView(generics.RetrieveAPIView):
    """View a single medical record"""
    permission_classes = [IsAuthenticated]
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return MedicalRecord.objects.filter(doctor=user.doctor_profile)
        return MedicalRecord.objects.filter(patient=user.patient_profile)