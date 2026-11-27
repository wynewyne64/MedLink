from django.urls import path
from .views import InitiatePaymentView, ConfirmPaymentView, PaymentListView, PaymentDetailView

urlpatterns = [
    path('', PaymentListView.as_view(), name='payment-list'),
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('<int:payment_id>/confirm/', ConfirmPaymentView.as_view(), name='payment-confirm'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),
]