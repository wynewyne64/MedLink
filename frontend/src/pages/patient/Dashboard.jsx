import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { getMyAppointments } from '../../api/appointments'
import { getDoctors } from '../../api/doctors'

const PatientDashboard = () => {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apptRes, docRes] = await Promise.all([
                    getMyAppointments(),
                    getDoctors(),
                ])
                setAppointments(apptRes.data)
                setDoctors(docRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const upcomingAppointments = appointments.filter(a =>
        ['pending', 'confirmed'].includes(a.status)
    )

    const pastAppointments = appointments.filter(a =>
        ['completed', 'cancelled'].includes(a.status)
    )

    const statusColors = {
        pending: 'bg-amber-500/10 text-amber-500 border border-amber-400/20',
        confirmed: 'bg-emerald-500/10 text-emerald-500 border border-emerald-400/20',
        completed: 'bg-sky-500/10 text-sky-500 border border-sky-400/20',
        cancelled: 'bg-red-500/10 text-red-500 border border-red-400/20',
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-white/70">Loading your health dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-slate-950 text-white">

            {/* SIDEBAR */}
            <aside className="w-72 bg-slate-900/60 backdrop-blur-xl border-r border-white/10 p-6 hidden md:block">

                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                        🏥
                    </div>
                    <div>
                        <p className="font-bold">Medlink</p>
                        <p className="text-xs text-white/50">Patient Portal</p>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-xs text-white/40">Welcome</p>
                    <p className="font-semibold">{user?.first_name}</p>
                </div>

                <nav className="space-y-2">
                    {[
                        { key: 'overview', label: 'Overview', icon: '📊' },
                        { key: 'appointments', label: 'Appointments', icon: '📅' },
                        { key: 'doctors', label: 'Doctors', icon: '🩺' },
                    ].map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                                activeTab === item.key
                                    ? 'bg-indigo-600 text-white'
                                    : 'hover:bg-white/5 text-white/70'
                            }`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-10 w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                    Logout
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 md:p-10">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Welcome back, {user?.first_name} 👋
                    </h1>
                    <p className="text-white/50 text-sm">
                        Manage your health in one modern dashboard
                    </p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Appointments', value: appointments.length, icon: '📅' },
                        { label: 'Upcoming', value: upcomingAppointments.length, icon: '⏳' },
                        { label: 'Completed', value: pastAppointments.filter(a => a.status === 'completed').length, icon: '✅' },
                        { label: 'Doctors', value: doctors.length, icon: '🩺' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
                            <p className="text-xl">{stat.icon}</p>
                            <p className="text-2xl font-bold mt-2">{stat.value}</p>
                            <p className="text-xs text-white/50">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-2 gap-6">

                        {/* UPCOMING */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="font-semibold mb-4">Upcoming Appointments</h2>

                            {upcomingAppointments.length === 0 ? (
                                <p className="text-white/50 text-sm">No upcoming appointments</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingAppointments.slice(0, 4).map(appt => (
                                        <div key={appt.id} className="flex justify-between p-3 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Dr. {appt.doctor?.user?.last_name}
                                                </p>
                                                <p className="text-xs text-white/50">
                                                    {appt.appointment_date} • {appt.appointment_time}
                                                </p>
                                            </div>

                                            <span className={`text-xs px-3 py-1 rounded-full ${statusColors[appt.status]}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* QUICK ACTIONS */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="font-semibold mb-4">Quick Actions</h2>

                            <div className="space-y-3">
                                {[
                                    { label: 'Find Doctor', desc: 'Browse specialists', icon: '🔍', action: () => setActiveTab('doctors') },
                                    { label: 'Records', desc: 'Medical history', icon: '📄', action: () => navigate('/patient/records') },
                                    { label: 'Profile', desc: 'Update details', icon: '👤', action: () => navigate('/patient/profile') },
                                    { label: 'Payments', desc: 'Manage bills', icon: '💳', action: () => navigate('/patient/payments') },
                                    { icon: '🏪', label: 'Pharmacy', value: '💊', icon: '🏪', color: 'bg-teal-50 text-teal-600', desc: 'Go to pharmacy', action: ()=> navigate('/patient/pharmacy') },

                                ].map(item => (
                                    <button
                                        key={item.label}
                                        onClick={item.action}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition"
                                    >
                                        <span>{item.icon}</span>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">{item.label}</p>
                                            <p className="text-xs text-white/50">{item.desc}</p>
                                        </div>
                                        <span className="ml-auto text-white/40">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* DOCTORS */}
                {activeTab === 'doctors' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

                        {doctors.map(doc => (
                            <div key={doc.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center overflow-hidden">
                                        {doc.profile_picture ? (
                                            <img src={doc.profile_picture} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-indigo-300">
                                                {doc.full_name?.[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-semibold">{doc.full_name}</p>
                                        <p className="text-xs text-indigo-300">
                                            {doc.specialization?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xs text-white/60 mb-4">
                                    <span>⭐ {doc.years_of_experience} yrs</span>
                                    <span className="font-semibold text-white">
                                        KES {doc.consultation_fee}
                                    </span>
                                </div>

                                <button
                                    onClick={() => navigate(`/patient/book/${doc.id}`)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-xl transition"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* APPOINTMENTS */}
                {activeTab === 'appointments' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="font-semibold mb-4">All Appointments</h2>

                        <div className="space-y-3">
                            {appointments.map(appt => (
                                <div key={appt.id} className="flex justify-between p-4 bg-white/5 rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Dr. {appt.doctor?.user?.first_name} {appt.doctor?.user?.last_name}
                                        </p>
                                        <p className="text-xs text-white/50">
                                            {appt.appointment_date} • {appt.appointment_time}
                                        </p>
                                    </div>

                                    <span className={`text-xs px-3 py-1 rounded-full ${statusColors[appt.status]}`}>
                                        {appt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

export default PatientDashboard