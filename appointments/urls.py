from django.urls import path
from .views import (
    AppointmentCreateView, PatientAppointmentListView,
    DoctorAppointmentListView, AppointmentDetailView,
    CancelAppointmentView
)

urlpatterns = [
    path('book/', AppointmentCreateView.as_view(), name='appointment-book'),
    path('my/', PatientAppointmentListView.as_view(), name='patient-appointments'),
    path('doctor/my/', DoctorAppointmentListView.as_view(), name='doctor-appointments'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:pk>/cancel/', CancelAppointmentView.as_view(), name='appointment-cancel'),
]