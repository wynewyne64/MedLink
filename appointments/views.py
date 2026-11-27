from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Appointment
from .serializers import (
    AppointmentSerializer, AppointmentCreateSerializer, AppointmentUpdateSerializer
)


class AppointmentCreateView(generics.CreateAPIView):
    """Patient books an appointment"""
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentCreateSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class PatientAppointmentListView(generics.ListAPIView):
    """Patient sees their own appointments"""
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user.patient_profile
        )


class DoctorAppointmentListView(generics.ListAPIView):
    """Doctor sees their own appointments"""
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.filter(
            doctor=self.request.user.doctor_profile
        )


class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    """View or update a single appointment"""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return Appointment.objects.filter(doctor=user.doctor_profile)
        return Appointment.objects.filter(patient=user.patient_profile)


class CancelAppointmentView(APIView):
    """Patient cancels their appointment"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(
                pk=pk, patient=request.user.patient_profile
            )
            if appointment.status in ['completed', 'cancelled']:
                return Response(
                    {'error': f'Cannot cancel a {appointment.status} appointment.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            appointment.status = 'cancelled'
            appointment.save()
            return Response({'message': 'Appointment cancelled successfully.'})
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)