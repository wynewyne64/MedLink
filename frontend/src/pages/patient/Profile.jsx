import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { updateProfile } from '../../api/auth'
import useAuthStore from '../../store/authStore'

const PatientProfile = () => {
    const { user, setAuth } = useAuthStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')
    const [form, setForm] = useState({
        // User fields
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        // Patient fields
        date_of_birth: '',
        gender: '',
        blood_group: '',
        address: '',
        insurance_provider: '',
        insurance_number: '',
        allergies: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [userRes, patientRes] = await Promise.all([
                    api.get('/auth/profile/'),
                    api.get('/patients/profile/'),
                ])
                const u = userRes.data
                const p = patientRes.data
                setForm({
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
                    email: u.email || '',
                    phone_number: u.phone_number || '',
                    date_of_birth: p.date_of_birth || '',
                    gender: p.gender || '',
                    blood_group: p.blood_group || '',
                    address: p.address || '',
                    insurance_provider: p.insurance_provider || '',
                    insurance_number: p.insurance_number || '',
                    allergies: p.allergies || '',
                    emergency_contact_name: p.emergency_contact_name || '',
                    emergency_contact_phone: p.emergency_contact_phone || '',
                })
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Update user fields
            const userRes = await updateProfile({
                first_name: form.first_name,
                last_name: form.last_name,
                phone_number: form.phone_number,
            })

            // Update patient fields
            await api.patch('/patients/profile/', {
                date_of_birth: form.date_of_birth || null,
                gender: form.gender,
                blood_group: form.blood_group,
                address: form.address,
                insurance_provider: form.insurance_provider,
                insurance_number: form.insurance_number,
                allergies: form.allergies,
                emergency_contact_name: form.emergency_contact_name,
                emergency_contact_phone: form.emergency_contact_phone,
            })

            // Update store
            const token = localStorage.getItem('access_token')
            const refresh = localStorage.getItem('refresh_token')
            setAuth(userRes.data, token, refresh)

            showToast('Profile updated successfully ✅')
        } catch (err) {
            showToast('Failed to update profile')
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

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
                    {toast}
                </div>
            )}

            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        ← Dashboard
                    </button>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🏥</span>
                        </div>
                        <span className="font-bold text-gray-900">My Profile</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        name="first_name"
                                        value={form.first_name}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        name="last_name"
                                        value={form.last_name}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input
                                    name="email"
                                    value={form.email}
                                    disabled
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    name="phone_number"
                                    value={form.phone_number}
                                    onChange={handleChange}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={form.date_of_birth}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Gender</label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Blood Group</label>
                                <select
                                    name="blood_group"
                                    value={form.blood_group}
                                    onChange={handleChange}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select</option>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Address</label>
                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Medical Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Allergies</label>
                                <input
                                    name="allergies"
                                    value={form.allergies}
                                    onChange={handleChange}
                                    placeholder="e.g. Penicillin, Peanuts"
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Insurance Provider</label>
                                    <input
                                        name="insurance_provider"
                                        value={form.insurance_provider}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Insurance Number</label>
                                    <input
                                        name="insurance_number"
                                        value={form.insurance_number}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Emergency Contact</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Contact Name</label>
                                <input
                                    name="emergency_contact_name"
                                    value={form.emergency_contact_name}
                                    onChange={handleChange}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                                <input
                                    name="emergency_contact_phone"
                                    value={form.emergency_contact_phone}
                                    onChange={handleChange}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default PatientProfile