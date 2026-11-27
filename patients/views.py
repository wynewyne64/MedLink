from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from authentication.permissions import IsPatient
from .models import Patient
from .serializers import PatientSerializer, PatientUpdateSerializer


class PatientProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsPatient]

    def get_object(self):
        return self.request.user.patient_profile

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PatientUpdateSerializer
        return PatientSerializer