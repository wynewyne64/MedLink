// src/pages/doctor/Appointments.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctorAppointments, updateAppointment } from '../../api/appointments'
import useAuthStore from '../../store/authStore'

const DoctorAppointments = () => {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [updating, setUpdating] = useState(null)
    const [toast, setToast] = useState('')

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const res = await getDoctorAppointments()
            setAppointments(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdating(id)
        try {
            await updateAppointment(id, { status: newStatus })
            setAppointments(prev =>
                prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
            )
            showToast(`Appointment ${newStatus} successfully`)
        } catch (err) {
            showToast('Failed to update appointment')
        } finally {
            setUpdating(null)
        }
    }

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(''), 3000)
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-green-100 text-green-700',
        completed: 'bg-blue-100 text-blue-700',
        cancelled: 'bg-red-100 text-red-700',
        no_show: 'bg-gray-100 text-gray-600',
    }

    const filtered = filter === 'all'
        ? appointments
        : appointments.filter(a => a.status === filter)

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-pulse">
                    {toast}
                </div>
            )}

            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/doctor/dashboard')}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            ← Dashboard
                        </button>
                        <div className="w-px h-5 bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">🏥</span>
                            </div>
                            <span className="font-bold text-gray-900">Appointments</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">My Appointments</h1>
                        <p className="text-sm text-gray-500">{appointments.length} total appointments</p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
                                filter === f
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-500 hover:text-gray-700 shadow-sm'
                            }`}
                        >
                            {f}
                            {f !== 'all' && (
                                <span className="ml-1 text-xs opacity-70">
                                    ({appointments.filter(a => a.status === f).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Appointments list */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-gray-500">No {filter === 'all' ? '' : filter} appointments</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((appt) => (
                            <div key={appt.id} className="bg-white rounded-2xl shadow-sm p-5">

                                {/* Patient info */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                                            {appt.patient?.user?.first_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {appt.patient?.user?.first_name} {appt.patient?.user?.last_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {appt.patient?.user?.email}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {appt.patient?.user?.phone_number}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[appt.status]}`}>
                                        {appt.status}
                                    </span>
                                </div>

                                {/* Appointment details */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {[
                                        { icon: '📅', label: 'Date', value: appt.appointment_date },
                                        { icon: '⏰', label: 'Time', value: appt.appointment_time },
                                        { icon: '💻', label: 'Type', value: appt.consultation_type },
                                    ].map((detail) => (
                                        <div key={detail.label} className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">{detail.icon} {detail.label}</p>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{detail.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Patient notes */}
                                {appt.patient_notes && (
                                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Patient's notes:</p>
                                        <p className="text-sm text-gray-700 italic">"{appt.patient_notes}"</p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    {appt.status === 'pending' && (
                                        <>
                                            <button
                                                disabled={updating === appt.id}
                                                onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {updating === appt.id ? '...' : '✅ Confirm'}
                                            </button>
                                            <button
                                                disabled={updating === appt.id}
                                                onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                ❌ Decline
                                            </button>
                                        </>
                                    )}
                                    {appt.status === 'confirmed' && (
                                        <>
                                            <button
                                                disabled={updating === appt.id}
                                                onClick={() => handleStatusUpdate(appt.id, 'completed')}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {updating === appt.id ? '...' : '🏁 Mark Complete'}
                                            </button>
                                            <button
                                                disabled={updating === appt.id}
                                                onClick={() => handleStatusUpdate(appt.id, 'no_show')}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                😶 No Show
                                            </button>
                                        </>
                                    )}
                                    {appt.status === 'completed' && (
                                        <button
                                            onClick={() => navigate(`/doctor/records/create/${appt.id}`)}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-colors"
                                        >
                                            📋 Write Medical Record
                                        </button>
                                    )}
                                    {['cancelled', 'no_show'].includes(appt.status) && (
                                        <p className="text-xs text-gray-400 italic">No actions available</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorAppointments