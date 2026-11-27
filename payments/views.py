import uuid
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Payment
from .serializers import PaymentSerializer
from appointments.models import Appointment


class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            appointment_id = request.data.get('appointment_id')
            payment_method = request.data.get('payment_method', 'mpesa')
            phone_number = request.data.get('phone_number', '')

            print(f"DEBUG: appointment_id={appointment_id}, user={request.user}")  # ← debug line

            appointment = Appointment.objects.get(
                id=appointment_id,
                patient=request.user.patient_profile
            )

            print(f"DEBUG: appointment found = {appointment}")  # ← debug line

            if hasattr(appointment, 'payment') and appointment.payment.status == 'completed':
                return Response({'error': 'Already paid.'}, status=status.HTTP_400_BAD_REQUEST)

            payment, created = Payment.objects.get_or_create(
                appointment=appointment,
                defaults={
                    'patient': request.user.patient_profile,
                    'amount': appointment.doctor.consultation_fee,
                    'payment_method': payment_method,
                    'phone_number': phone_number,
                    'status': 'pending',
                }
            )

            print(f"DEBUG: payment created={created}, payment={payment}")  # ← debug line

            serializer = PaymentSerializer(payment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"PAYMENT ERROR: {e}")  # ← this will show exact error
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfirmPaymentView(APIView):
    """Simulates payment confirmation — no real M-Pesa connection"""
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(
                id=payment_id,
                patient=request.user.patient_profile
            )
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if payment.status == 'completed':
            return Response({'error': 'Payment already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Simulate successful payment
        payment.status = 'completed'
        payment.transaction_code = f'MOCK-{uuid.uuid4().hex[:8].upper()}'
        payment.paid_at = timezone.now()
        payment.save()

        serializer = PaymentSerializer(payment)
        return Response({
            'message': 'Payment successful!',
            'transaction_code': payment.transaction_code,
            'payment': serializer.data
        })


class PaymentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(
            patient=request.user.patient_profile
        ).order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


class PaymentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk, patient=request.user.patient_profile)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)