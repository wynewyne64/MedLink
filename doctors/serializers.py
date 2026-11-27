# doctors/serializers.py
from rest_framework import serializers
from .models import Doctor, Specialization, DoctorAvailability
from authentication.serializers import UserSerializer


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name']


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = DoctorAvailability
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time']


class DoctorListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    specialization = SpecializationSerializer(read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'specialization', 'profile_picture',
            'consultation_fee', 'years_of_experience',
            'available_for_consultation'
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture:
            if request:
                return request.build_absolute_uri(obj.user.profile_picture.url)
            return obj.user.profile_picture.url
        return None


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    availability = DoctorAvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'specialization', 'license_number',
            'years_of_experience', 'consultation_fee', 'bio',
            'is_verified', 'available_for_consultation', 'availability'
        ]


class DoctorUpdateSerializer(serializers.ModelSerializer):
    specialization_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialization.objects.all(), source='specialization',
        allow_null=True, required=False
    )

    class Meta:
        model = Doctor
        fields = [
            'specialization_id', 'years_of_experience',
            'consultation_fee', 'bio', 'available_for_consultation'
        ]