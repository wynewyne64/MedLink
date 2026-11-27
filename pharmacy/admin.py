# pharmacy/admin.py
from django.contrib import admin
from .models import Category, Medicine, Cart, CartItem, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'description']
    search_fields = ['name']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['medicine', 'quantity', 'price']


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'requires_prescription', 'is_available']
    list_filter = ['category', 'requires_prescription', 'is_available']
    search_fields = ['name', 'manufacturer']
    list_editable = ['price', 'stock', 'is_available']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_patient', 'total_amount', 'status', 'transaction_code', 'created_at']
    list_filter = ['status']
    search_fields = ['transaction_code']
    list_editable = ['status']
    inlines = [OrderItemInline]

    def get_patient(self, obj):
        return obj.patient.user.get_full_name()
    get_patient.short_description = 'Patient'