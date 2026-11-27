# doctors/urls.py
from django.urls import path
from .views import (
    DoctorListView, DoctorDetailView, DoctorProfileView,
    DoctorAvailabilityView, SpecializationListView
)

urlpatterns = [
    path('', DoctorListView.as_view(), name='doctor-list'),
    path('<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('availability/', DoctorAvailabilityView.as_view(), name='doctor-availability'),
    path('availability/<int:pk>/', DoctorAvailabilityView.as_view(), name='doctor-availability-delete'),
    path('specializations/', SpecializationListView.as_view(), name='specialization-list'),
]