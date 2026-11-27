import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../../api/auth'
import useAuthStore from '../../store/authStore'

const Register = () => {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: 'patient',
        password: '',
        password2: '',
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

   const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
        // Step 1 — Register
        await registerUser(form)

        // Step 2 — Login
        const { loginUser } = await import('../../api/auth')
        const loginRes = await loginUser({
            username: form.username,
            password: form.password,
        })
        const { access, refresh } = loginRes.data

        // Step 3 — Save tokens FIRST
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)

        // Step 4 — Fetch profile
        const { getUserProfile } = await import('../../api/auth')
        const profileRes = await getUserProfile()

        // Step 5 — Save to store and redirect
        setAuth(profileRes.data, access, refresh)
        navigate(form.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')

    } catch (err) {
        const data = err.response?.data
        const firstError = data ? Object.values(data)[0] : null
        setError(Array.isArray(firstError) ? firstError[0] : 'Registration failed. Please try again.')
    } finally {
        setLoading(false)
     }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl mb-3">
                        <span className="text-white text-2xl">🏥</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join Medlink today</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-3">
                        {['patient', 'doctor'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setForm({ ...form, role: r })}
                                className={`py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                                    form.role === r
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                {r === 'patient' ? '🧑‍⚕️ Patient' : '👨‍⚕️ Doctor'}
                            </button>
                        ))}
                    </div>

                    {/* Name fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">First Name</label>
                            <input
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            name="phone_number"
                            value={form.phone_number}
                            onChange={handleChange}
                            placeholder="0712345678"
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            name="password2"
                            type="password"
                            value={form.password2}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register