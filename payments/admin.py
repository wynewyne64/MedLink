# payments/admin.py
from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_patient', 'amount', 'payment_method', 'status', 'transaction_code', 'paid_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['patient__user__first_name', 'transaction_code']
    readonly_fields = ['created_at', 'paid_at']

    def get_patient(self, obj):
        return obj.patient.user.get_full_name()
    get_patient.short_description = 'Patient'