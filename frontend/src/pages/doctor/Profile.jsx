// src/pages/doctor/Profile.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctorProfile, updateDoctorProfile , getSpecializations } from '../../api/doctors'
import { uploadProfilePicture } from '../../api/doctors'
import { updateProfile as updateUserProfile } from '../../api/auth'
import useAuthStore from '../../store/authStore'
import api from '../../api/axios'

const DoctorProfile = () => {
    const { user, setAuth } = useAuthStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')
    const [specializations, setSpecializations] = useState([])
    const [previewImage, setPreviewImage] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        specialization_id: '',
        license_number: '',
        years_of_experience: '',
        consultation_fee: '',
        bio: '',
        available_for_consultation: true,
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, doctorRes, specRes] = await Promise.all([
                    api.get('/auth/profile/'),
                    getDoctorProfile(),
                    getSpecializations(),
                ])
                const u = userRes.data
                const d = doctorRes.data
                setSpecializations(specRes.data)
                if (u.profile_picture) setPreviewImage(u.profile_picture)
                setForm({
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
                    email: u.email || '',
                    phone_number: u.phone_number || '',
                    specialization_id: d.specialization?.id || '',
                    license_number: d.license_number || '',
                    years_of_experience: d.years_of_experience || '',
                    consultation_fee: d.consultation_fee || '',
                    bio: d.bio || '',
                    available_for_consultation: d.available_for_consultation ?? true,
                })
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm({ ...form, [e.target.name]: value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image must be under 2MB')
            return
        }
        setImageFile(file)
        setPreviewImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Upload profile picture if changed
            if (imageFile) {
                const formData = new FormData()
                formData.append('profile_picture', imageFile)
                await api.patch('/auth/profile/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }

            // Update user fields
            const userRes = await updateUserProfile({
                first_name: form.first_name,
                last_name: form.last_name,
                phone_number: form.phone_number,
            })

            // Update doctor fields
            await updateDoctorProfile({
                specialization_id: form.specialization_id || null,
                license_number: form.license_number,
                years_of_experience: parseInt(form.years_of_experience) || 0,
                consultation_fee: parseFloat(form.consultation_fee) || 0,
                bio: form.bio,
                available_for_consultation: form.available_for_consultation,
            })

            const token = localStorage.getItem('access_token')
            const refresh = localStorage.getItem('refresh_token')
            setAuth(userRes.data, token, refresh)

            showToast('Profile updated successfully ✅')
        } catch (err) {
            showToast('Failed to update profile')
            console.error(err)
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

            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
                    {toast}
                </div>
            )}

            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => navigate('/doctor/dashboard')} className="text-gray-500 hover:text-gray-700 text-sm">
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

                    {/* Profile Picture */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Profile Picture</h2>
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-indigo-600 font-bold text-2xl">
                                        {form.first_name?.[0] || user?.first_name?.[0]}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="profile_picture"
                                    className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-block"
                                >
                                    {previewImage ? 'Change Photo' : 'Upload Photo'}
                                </label>
                                <input
                                    id="profile_picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                                {previewImage && (
                                    <button
                                        type="button"
                                        onClick={() => { setPreviewImage(null); setImageFile(null) }}
                                        className="text-xs text-red-500 hover:text-red-700 mt-1 block"
                                    >
                                        Remove photo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <input name="first_name" value={form.first_name} onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <input name="last_name" value={form.last_name} onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input value={form.email} disabled
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <input name="phone_number" value={form.phone_number} onChange={handleChange}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Professional Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Specialization</label>
                                <select name="specialization_id" value={form.specialization_id} onChange={handleChange}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select specialization</option>
                                    {specializations.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">License Number</label>
                                <input name="license_number" value={form.license_number} onChange={handleChange}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                                    <input name="years_of_experience" type="number" min="0" value={form.years_of_experience} onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Consultation Fee (KES)</label>
                                    <input name="consultation_fee" type="number" min="0" value={form.consultation_fee} onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Bio</label>
                                <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
                                    placeholder="Tell patients about yourself..."
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Available for Consultation</p>
                                    <p className="text-xs text-gray-500">Patients can book appointments with you</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="available_for_consultation"
                                        checked={form.available_for_consultation} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default DoctorProfile