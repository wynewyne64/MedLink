// src/pages/doctor/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { getDoctorAppointments } from '../../api/appointments'
import { getDoctorProfile } from '../../api/doctors'

const DoctorDashboard = () => {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apptRes, profileRes] = await Promise.all([
                    getDoctorAppointments(),
                    getDoctorProfile(),
                ])
                setAppointments(apptRes.data)
                setProfile(profileRes.data)
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

    const pendingAppointments = appointments.filter(a => a.status === 'pending')
    const confirmedAppointments = appointments.filter(a => a.status === 'confirmed')
    const completedAppointments = appointments.filter(a => a.status === 'completed')
    const todayAppointments = appointments.filter(a => {
        const today = new Date().toISOString().split('T')[0]
        return a.appointment_date === today
    })

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-green-100 text-green-700',
        completed: 'bg-blue-100 text-blue-700',
        cancelled: 'bg-red-100 text-red-700',
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading your dashboard...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🏥</span>
                        </div>
                        <span className="font-bold text-gray-900">Medlink</span>
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium ml-1">Doctor</span>
                    </div>
                   {/* Replace the Dr. text avatar in navbar with this */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                        {user?.profile_picture ? (
                             <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                         <span className="text-indigo-600 font-bold text-xs">
                                {user?.first_name?.[0]}
                         </span>
                        )}
                    </div>
                     <span className="text-sm text-gray-600">
                        Dr. <span className="font-medium text-gray-900">{user?.last_name}</span>
                     </span>
                </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                            Logout
                        </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-6">

                {/* Welcome banner */}
                <div className="bg-gradient-to-r from-teal-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
                    <h1 className="text-2xl font-bold mb-1">
                        Welcome, Dr. {user?.first_name} {user?.last_name} 👨‍⚕️
                    </h1>
                    <p className="text-teal-100 text-sm">
                        {profile?.specialization?.name || 'General Practitioner'} •{' '}
                        {profile?.years_of_experience || 0} years experience
                    </p>
                    {todayAppointments.length > 0 && (
                        <div className="mt-3 bg-white/20 rounded-lg px-4 py-2 inline-block">
                            <p className="text-sm font-medium">
                                📅 You have {todayAppointments.length} appointment(s) today
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Appointments', value: appointments.length, icon: '📅', color: 'bg-blue-50 text-blue-600' },
                        { label: 'Pending', value: pendingAppointments.length, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
                        { label: 'Confirmed', value: confirmedAppointments.length, icon: '✅', color: 'bg-green-50 text-green-600' },
                        { label: 'Completed', value: completedAppointments.length, icon: '🏁', color: 'bg-purple-50 text-purple-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center text-lg mb-3`}>
                                {stat.icon}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs — only overview and profile */}
                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
                    {['overview', 'profile'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                activeTab === tab
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Today's appointments */}
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h2 className="font-semibold text-gray-900 mb-4">Today's Appointments</h2>
                            {todayAppointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-4xl mb-2">😌</p>
                                    <p className="text-gray-500 text-sm">No appointments today</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todayAppointments.map((appt) => (
                                        <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                                                    {appt.patient?.user?.first_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {appt.patient?.user?.first_name} {appt.patient?.user?.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{appt.appointment_time} • {appt.consultation_type}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[appt.status]}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* View all appointments button */}
                            <button
                                onClick={() => navigate('/doctor/appointments')}
                                className="mt-4 w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                View All Appointments →
                            </button>
                        </div>

                        {/* Pending requests */}
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h2 className="font-semibold text-gray-900 mb-4">
                                Pending Requests
                                {pendingAppointments.length > 0 && (
                                    <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                                        {pendingAppointments.length}
                                    </span>
                                )}
                            </h2>
                            {pendingAppointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-4xl mb-2">✨</p>
                                    <p className="text-gray-500 text-sm">No pending requests</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingAppointments.slice(0, 4).map((appt) => (
                                        <div key={appt.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {appt.patient?.user?.first_name} {appt.patient?.user?.last_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {appt.appointment_date} at {appt.appointment_time}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/doctor/appointments')}
                                                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* View all appointments button */}
                            <button
                                onClick={() => navigate('/doctor/appointments')}
                                className="mt-4 w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Manage All Appointments →
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl shadow-sm p-5 max-w-lg">
                        <h2 className="font-semibold text-gray-900 mb-4">My Profile</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Full Name', value: `Dr. ${user?.first_name} ${user?.last_name}` },
                                { label: 'Email', value: user?.email },
                                { label: 'Phone', value: user?.phone_number || 'Not set' },
                                { label: 'Specialization', value: profile?.specialization?.name || 'Not set' },
                                { label: 'License Number', value: profile?.license_number },
                                { label: 'Experience', value: `${profile?.years_of_experience || 0} years` },
                                { label: 'Consultation Fee', value: `KES ${profile?.consultation_fee || 0}` },
                                { label: 'Verification', value: profile?.is_verified ? '✅ Verified' : '⏳ Pending' },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">{item.label}</span>
                                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <button
                           onClick={() => navigate('/doctor/profile')}
                           className="mt-4 w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                           Edit Profile →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorDashboard