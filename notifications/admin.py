# notifications/admin.py
from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['get_user', 'type', 'title', 'is_read', 'created_at']
    list_filter = ['type', 'is_read']
    search_fields = ['user__username', 'title', 'message']
    readonly_fields = ['created_at']

    def get_user(self, obj):
        return obj.user.get_full_name()
    get_user.short_description = 'User'