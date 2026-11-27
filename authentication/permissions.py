# authentication/permissions.py
from rest_framework.permissions import BasePermission


class IsPatient(BasePermission):
    """Only allows access to users with role 'patient'"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'patient'


class IsDoctor(BasePermission):
    """Only allows access to users with role 'doctor'"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'doctor'


class IsAdmin(BasePermission):
    """Only allows access to users with role 'admin'"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'