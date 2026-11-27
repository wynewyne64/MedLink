from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from authentication.permissions import IsDoctor
from rest_framework.views import APIView
from .models import Doctor, Specialization, DoctorAvailability
from .serializers import (
    DoctorSerializer, DoctorUpdateSerializer, DoctorListSerializer,
    SpecializationSerializer, DoctorAvailabilitySerializer
)


class DoctorListView(generics.ListAPIView):
    """Public — anyone can browse doctors"""
    serializer_class = DoctorListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Doctor.objects.filter(is_verified=True, available_for_consultation=True)
        # Filter by specialization if provided
        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specialization__name__icontains=specialization)
        return queryset


class DoctorDetailView(generics.RetrieveAPIView):
    """Public — view a single doctor's full profile"""
    serializer_class = DoctorSerializer
    permission_classes = [AllowAny]
    queryset = Doctor.objects.filter(is_verified=True)


class DoctorProfileView(generics.RetrieveUpdateAPIView):
    """Doctor manages their own profile"""
    permission_classes = [IsDoctor]

    def get_object(self):
        return self.request.user.doctor_profile

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DoctorUpdateSerializer
        return DoctorSerializer


class DoctorAvailabilityView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):
        availability = DoctorAvailability.objects.filter(
            doctor=request.user.doctor_profile
        )
        serializer = DoctorAvailabilitySerializer(availability, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DoctorAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(doctor=request.user.doctor_profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            slot = DoctorAvailability.objects.get(pk=pk, doctor=request.user.doctor_profile)
            slot.delete()
            return Response({'message': 'Availability slot deleted.'}, status=status.HTTP_204_NO_CONTENT)
        except DoctorAvailability.DoesNotExist:
            return Response({'error': 'Slot not found.'}, status=status.HTTP_404_NOT_FOUND)


class SpecializationListView(generics.ListAPIView):
    serializer_class = SpecializationSerializer
    permission_classes = [AllowAny]
    queryset = Specialization.objects.all()