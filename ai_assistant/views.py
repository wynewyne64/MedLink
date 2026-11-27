from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .claude_service import get_ai_response


class AIAssistantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        mode = request.data.get('mode', 'medical_assistant')
        message = request.data.get('message', '')
        conversation_history = request.data.get('history', [])

        if not message:
            return Response(
                {'error': 'Message is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate mode
        valid_modes = ['symptom_checker', 'medical_assistant', 'doctor_assistant']
        if mode not in valid_modes:
            return Response(
                {'error': 'Invalid mode.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only doctors can use doctor_assistant mode
        if mode == 'doctor_assistant' and request.user.role != 'doctor':
            return Response(
                {'error': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Build patient context
        patient_context = None
        try:
            if request.user.role == 'patient':
                profile = request.user.patient_profile
                patient_context = {
                    'name': request.user.get_full_name(),
                    'blood_group': profile.blood_group,
                    'allergies': profile.allergies,
                }
            elif request.user.role == 'doctor':
                patient_context = {
                    'name': f"Dr. {request.user.get_full_name()}",
                }
        except Exception:
            pass

        try:
            ai_response = get_ai_response(
                mode=mode,
                conversation_history=conversation_history,
                user_message=message,
                patient_context=patient_context,
            )
            return Response({'response': ai_response})
        except Exception as e:
            return Response(
                {'error': 'AI service temporarily unavailable. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )