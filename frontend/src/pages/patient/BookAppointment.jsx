import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDoctorDetail } from '../../api/doctors'
import { bookAppointment } from '../../api/appointments'

const BookAppointment = () => {
    const { doctorId } = useParams()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [form, setForm] = useState({
        doctor: doctorId,
        appointment_date: '',
        appointment_time: '',
        consultation_type: 'video',
        patient_notes: '',
    })

    useEffect(() => {
        getDoctorDetail(doctorId)
            .then(res => setDoctor(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [doctorId])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await bookAppointment(form)
            setSuccess(true)
            setTimeout(() => navigate('/patient/dashboard'), 2000)
        } catch (err) {
            const data = err.response?.data
            const firstError = data ? Object.values(data)[0] : null
            setError(Array.isArray(firstError) ? firstError[0] : 'Booking failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // Minimum date is today
    const today = new Date().toISOString().split('T')[0]

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
                <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ← Back
                    </button>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🏥</span>
                        </div>
                        <span className="font-bold text-gray-900">Book Appointment</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Doctor card */}
                {doctor && (
                    <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                            {doctor.user?.first_name?.[0]}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-gray-900">
                                Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                            </h2>
                            <p className="text-indigo-600 text-sm">{doctor.specialization?.name}</p>
                            <p className="text-gray-500 text-xs mt-1">
                                {doctor.years_of_experience} years experience
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">KES {doctor.consultation_fee}</p>
                            <p className="text-xs text-gray-500">per session</p>
                        </div>
                    </div>
                )}

                {/* Booking form */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-5">Appointment Details</h3>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Consultation type */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Consultation Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'video', label: '📹 Video Call' },
                                    { value: 'chat', label: '💬 Chat' },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, consultation_type: type.value })}
                                        className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                                            form.consultation_type === type.value
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Appointment Date
                            </label>
                            <input
                                type="date"
                                name="appointment_date"
                                value={form.appointment_date}
                                onChange={handleChange}
                                min={today}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Time */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Preferred Time
                            </label>
                            <input
                                type="time"
                                name="appointment_time"
                                value={form.appointment_time}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Symptoms / Reason for visit
                            </label>
                            <textarea
                                name="patient_notes"
                                value={form.patient_notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describe your symptoms or reason for the appointment..."
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                        >
                            {submitting ? 'Booking...' : 'Confirm Appointment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default BookAppointment