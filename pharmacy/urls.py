# pharmacy/urls.py
from django.urls import path
from .views import (
    CategoryListView, MedicineListView, MedicineDetailView,
    CartView, CartItemView, CheckoutView,
    OrderListView, OrderDetailView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('medicines/', MedicineListView.as_view(), name='medicine-list'),
    path('medicines/<int:pk>/', MedicineDetailView.as_view(), name='medicine-detail'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/<int:item_id>/', CartItemView.as_view(), name='cart-item'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]