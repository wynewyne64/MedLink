import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications'
import useAuthStore from '../store/authStore'

const typeIcons = {
    appointment: '📅',
    payment: '💳',
    prescription: '💊',
    system: '🔔',
}

const Notifications = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getNotifications()
            .then(res => setNotifications(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id)
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
        } catch (err) {
            console.error(err)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        } catch (err) {
            console.error(err)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length
    const dashboardPath = user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate(dashboardPath)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        ← Dashboard
                    </button>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🏥</span>
                        </div>
                        <span className="font-bold text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <p className="text-5xl mb-4">🔔</p>
                        <p className="text-gray-700 font-medium">No notifications yet</p>
                        <p className="text-gray-500 text-sm mt-1">You'll be notified about appointments and updates</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => !n.is_read && handleMarkRead(n.id)}
                                className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 transition-all cursor-pointer ${
                                    !n.is_read ? 'border-l-4 border-indigo-500' : 'opacity-70'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                                    !n.is_read ? 'bg-indigo-100' : 'bg-gray-100'
                                }`}>
                                    {typeIcons[n.type] || '🔔'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-sm font-medium ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {n.title}
                                        </p>
                                        {!n.is_read && (
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(n.created_at).toLocaleDateString('en-KE', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Notifications