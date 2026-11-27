# payments/serializers.py
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    appointment_date = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'payment_method', 'status',
            'transaction_code', 'phone_number', 'paid_at',
            'created_at', 'doctor_name', 'appointment_date',
            'appointment'
        ]

    def get_doctor_name(self, obj):
        try:
            return f"Dr. {obj.appointment.doctor.user.get_full_name()}"
        except Exception:
            return 'Unknown'

    def get_appointment_date(self, obj):
        try:
            return obj.appointment.appointment_date
        except Exception:
            return None