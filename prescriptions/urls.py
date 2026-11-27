from django.urls import path
from .views import (
    MedicalRecordCreateView, PatientMedicalRecordListView, MedicalRecordDetailView
)

urlpatterns = [
    path('records/create/', MedicalRecordCreateView.as_view(), name='record-create'),
    path('records/', PatientMedicalRecordListView.as_view(), name='patient-records'),
    path('records/<int:pk>/', MedicalRecordDetailView.as_view(), name='record-detail'),
]