# pharmacy/views.py
import uuid
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from .models import Category, Medicine, Cart, CartItem, Order, OrderItem
from .serializers import (
    CategorySerializer, MedicineSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer
)


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.all()


class MedicineListView(generics.ListAPIView):
    serializer_class = MedicineSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Medicine.objects.filter(is_available=True)
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        prescription = self.request.query_params.get('requires_prescription')
        if category:
            queryset = queryset.filter(category__id=category)
        if search:
            queryset = queryset.filter(name__icontains=search)
        if prescription:
            queryset = queryset.filter(requires_prescription=prescription == 'true')
        return queryset

    def get_serializer_context(self):
        return {'request': self.request}


class MedicineDetailView(generics.RetrieveAPIView):
    serializer_class = MedicineSerializer
    permission_classes = [AllowAny]
    queryset = Medicine.objects.filter(is_available=True)

    def get_serializer_context(self):
        return {'request': self.request}


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get_or_create_cart(self, request):
        cart, _ = Cart.objects.get_or_create(
            patient=request.user.patient_profile
        )
        return cart

    def get(self, request):
        cart = self.get_or_create_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        """Add item to cart"""
        cart = self.get_or_create_cart(request)
        medicine_id = request.data.get('medicine_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            medicine = Medicine.objects.get(id=medicine_id, is_available=True)
        except Medicine.DoesNotExist:
            return Response({'error': 'Medicine not found.'}, status=status.HTTP_404_NOT_FOUND)

        if medicine.stock < quantity:
            return Response({'error': f'Only {medicine.stock} units available.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, medicine=medicine,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request):
        """Clear entire cart"""
        cart = self.get_or_create_cart(request)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        """Update item quantity"""
        try:
            item = CartItem.objects.get(
                id=item_id,
                cart__patient=request.user.patient_profile
            )
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        quantity = int(request.data.get('quantity', 1))
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        cart = Cart.objects.get(patient=request.user.patient_profile)
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        """Remove single item from cart"""
        try:
            item = CartItem.objects.get(
                id=item_id,
                cart__patient=request.user.patient_profile
            )
            item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        cart = Cart.objects.get(patient=request.user.patient_profile)
        return Response(CartSerializer(cart).data)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(patient=request.user.patient_profile)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        if not cart.items.exists():
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        delivery_address = request.data.get('delivery_address', '')
        phone_number = request.data.get('phone_number', '')
        notes = request.data.get('notes', '')

        if not delivery_address or not phone_number:
            return Response(
                {'error': 'Delivery address and phone number are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create order
        order = Order.objects.create(
            patient=request.user.patient_profile,
            total_amount=cart.total,
            delivery_address=delivery_address,
            phone_number=phone_number,
            notes=notes,
            status='confirmed',
            transaction_code=f'RX-{uuid.uuid4().hex[:8].upper()}'
        )

        # Create order items and update stock
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                medicine=item.medicine,
                quantity=item.quantity,
                price=item.medicine.price,
            )
            # Reduce stock
            item.medicine.stock -= item.quantity
            item.medicine.save()

        # Clear cart
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(
            patient=self.request.user.patient_profile
        ).order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(patient=self.request.user.patient_profile)