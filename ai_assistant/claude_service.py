# ai_assistant/claude_service.py

import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

SYMPTOM_CHECKER_PROMPT = """You are MediLink's AI Symptom Checker. You are a helpful, empathetic medical assistant.

When a patient describes their symptoms:
1. Acknowledge their symptoms with empathy
2. Ask 1-2 clarifying questions if needed
3. Suggest 2-3 possible conditions that could match their symptoms
4. Recommend which type of specialist they should see
5. Give simple self-care advice if appropriate
6. Always remind them that this is NOT a diagnosis and they should consult a real doctor

Keep responses concise and easy to understand.
Never be alarming. Always be warm and reassuring.
If symptoms sound like a medical emergency (chest pain, difficulty breathing, stroke symptoms)
immediately tell them to call emergency services."""

MEDICAL_ASSISTANT_PROMPT = """You are MediLink's AI Medical Assistant. You are a knowledgeable,
friendly health guide for patients.

You can help with:
- Answering general health questions
- Explaining medical terms in simple language
- Providing information about medications (general info only)
- Giving wellness and prevention tips
- Explaining what to expect during medical procedures
- Helping patients understand their diagnoses

Rules:
- Always recommend consulting a real doctor for specific medical advice
- Never prescribe or recommend specific medications
- Be warm, clear and easy to understand
- If asked about emergencies, direct to emergency services immediately
- Keep responses focused and not too long"""

DOCTOR_ASSISTANT_PROMPT = """You are MediLink's AI Doctor Assistant. You are a clinical decision
support tool for verified medical professionals.

You can help doctors with:
- Suggesting differential diagnoses based on symptoms and patient history
- Recommending treatment protocols based on clinical guidelines
- Suggesting appropriate investigations/tests to order
- Providing drug dosage information and interactions
- Helping write clear, professional medical notes
- Summarizing clinical research on specific conditions

Rules:
- Always remind that final clinical decisions rest with the doctor
- Base suggestions on evidence-based medicine
- Be precise and use appropriate medical terminology
- Flag any red flags or urgent considerations
- Format responses clearly with sections when appropriate"""


def get_ai_response(mode, conversation_history, user_message, patient_context=None):
    try:
        system_prompts = {
            'symptom_checker': SYMPTOM_CHECKER_PROMPT,
            'medical_assistant': MEDICAL_ASSISTANT_PROMPT,
            'doctor_assistant': DOCTOR_ASSISTANT_PROMPT,
        }

        system = system_prompts.get(mode, MEDICAL_ASSISTANT_PROMPT)

        # Add patient context
        if patient_context:
            context_str = "\n\nPatient Context:\n"

            if patient_context.get('name'):
                context_str += f"- Name: {patient_context['name']}\n"

            if patient_context.get('blood_group'):
                context_str += f"- Blood Group: {patient_context['blood_group']}\n"

            if patient_context.get('allergies'):
                context_str += f"- Known Allergies: {patient_context['allergies']}\n"

            system += context_str

        # Initialize Gemini model
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system,
        )

        # Convert history to Gemini format
        gemini_history = []

        for msg in conversation_history:
            role = "user" if msg["role"] == "user" else "model"

            gemini_history.append({
                "role": role,
                "parts": [msg["content"]]
            })

        # Start chat session
        chat = model.start_chat(history=gemini_history)

        # Generate response
        response = chat.send_message(user_message)

        if response and hasattr(response, "text"):
            return response.text

        return (
            "I'm sorry, but I couldn't generate a response at the moment. "
            "Please try again later."
        )

    except Exception as e:
        print(f"Gemini API Error: {str(e)}")

        return (
            "I'm sorry, but the AI assistant is currently unavailable. "
            "Please try again in a few moments or consult a healthcare professional if you need immediate assistance."
        )