// src/pages/doctor/CreateMedicalRecord.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAppointmentDetail } from '../../api/appointments'
import { createMedicalRecord } from '../../api/records'

const CreateMedicalRecord = () => {
    const { appointmentId } = useParams()
    const navigate = useNavigate()
    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        diagnosis: '',
        treatment: '',
        notes: '',
    })

    const [prescriptions, setPrescriptions] = useState([
        {
            id: Date.now(),
            medication_name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
        }
    ])

    useEffect(() => {
        getAppointmentDetail(appointmentId)
            .then(res => setAppointment(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [appointmentId])

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handlePrescriptionChange = (id, field, value) => {
        setPrescriptions(prev =>
            prev.map(p => p.id === id ? { ...p, [field]: value } : p)
        )
    }

    const addPrescription = () => {
        setPrescriptions(prev => [...prev, {
            id: Date.now(),
            medication_name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
        }])
    }

    const removePrescription = (id) => {
        if (prescriptions.length === 1) return
        setPrescriptions(prev => prev.filter(p => p.id !== id))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Clean prescriptions — remove the local id field
            const cleanPrescriptions = prescriptions
                .filter(p => p.medication_name.trim())
                .map(({ id, ...rest }) => rest)

            await createMedicalRecord({
                patient: appointment.patient.id,
                appointment: appointmentId,
                diagnosis: form.diagnosis,
                treatment: form.treatment,
                notes: form.notes,
                prescriptions: cleanPrescriptions,
            })

            setSuccess(true)
            setTimeout(() => navigate('/doctor/appointments'), 2000)
        } catch (err) {
            console.error(err)
            showToast('Failed to save record. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(''), 3000)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Record Saved!</h2>
                <p className="text-gray-500 text-sm">Redirecting back to appointments...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-red-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
                    {toast}
                </div>
            )}

            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/doctor/appointments')}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        ← Appointments
                    </button>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🏥</span>
                        </div>
                        <span className="font-bold text-gray-900">Write Medical Record</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Patient info card */}
                    {appointment && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                                {appointment.patient?.user?.first_name?.[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {appointment.patient?.user?.first_name} {appointment.patient?.user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {appointment.appointment_date} • {appointment.appointment_time} • {appointment.consultation_type}
                                </p>
                                {appointment.patient_notes && (
                                    <p className="text-xs text-indigo-600 mt-1 italic">
                                        "{appointment.patient_notes}"
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Diagnosis & Treatment */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Clinical Notes</h2>
                        <div className="space-y-4">

                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Diagnosis <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="diagnosis"
                                    value={form.diagnosis}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="e.g. Acute upper respiratory tract infection"
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Treatment Plan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="treatment"
                                    value={form.treatment}
                                    onChange={handleFormChange}
                                    required
                                    rows={3}
                                    placeholder="Describe the treatment plan..."
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleFormChange}
                                    rows={2}
                                    placeholder="Any additional notes or follow-up instructions..."
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prescriptions */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-900">Prescriptions</h2>
                            <button
                                type="button"
                                onClick={addPrescription}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                + Add Medication
                            </button>
                        </div>

                        <div className="space-y-5">
                            {prescriptions.map((p, index) => (
                                <div key={p.id} className="bg-gray-50 rounded-xl p-4 relative">

                                    {/* Remove button */}
                                    {prescriptions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePrescription(p.id)}
                                            className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs"
                                        >
                                            ✕ Remove
                                        </button>
                                    )}

                                    <p className="text-xs font-semibold text-indigo-600 mb-3">
                                        💊 Medication {index + 1}
                                    </p>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700">Medication Name <span className="text-red-500">*</span></label>
                                            <input
                                                value={p.medication_name}
                                                onChange={(e) => handlePrescriptionChange(p.id, 'medication_name', e.target.value)}
                                                placeholder="e.g. Amoxicillin"
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">Dosage <span className="text-red-500">*</span></label>
                                                <input
                                                    value={p.dosage}
                                                    onChange={(e) => handlePrescriptionChange(p.id, 'dosage', e.target.value)}
                                                    placeholder="e.g. 500mg"
                                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">Duration <span className="text-red-500">*</span></label>
                                                <input
                                                    value={p.duration}
                                                    onChange={(e) => handlePrescriptionChange(p.id, 'duration', e.target.value)}
                                                    placeholder="e.g. 7 days"
                                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-700">Frequency <span className="text-red-500">*</span></label>
                                            <select
                                                value={p.frequency}
                                                onChange={(e) => handlePrescriptionChange(p.id, 'frequency', e.target.value)}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                <option value="">Select frequency</option>
                                                <option value="Once daily">Once daily</option>
                                                <option value="Twice daily">Twice daily</option>
                                                <option value="Three times daily">Three times daily</option>
                                                <option value="Four times daily">Four times daily</option>
                                                <option value="Every 8 hours">Every 8 hours</option>
                                                <option value="Every 12 hours">Every 12 hours</option>
                                                <option value="As needed">As needed</option>
                                                <option value="At bedtime">At bedtime</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-700">Instructions</label>
                                            <input
                                                value={p.instructions}
                                                onChange={(e) => handlePrescriptionChange(p.id, 'instructions', e.target.value)}
                                                placeholder="e.g. Take after meals with water"
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving Record...' : '💾 Save Medical Record'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateMedicalRecord