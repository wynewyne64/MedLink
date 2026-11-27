import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, getUserProfile } from '../../api/auth'
import useAuthStore from '../../store/authStore'

const Login = () => {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({ username: '', password: '' })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
        // Step 1 — Login and get tokens
        const loginRes = await loginUser(form)
        const { access, refresh } = loginRes.data

        // Step 2 — Save tokens to localStorage FIRST
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)

        // Step 3 — Now fetch profile (axios interceptor will attach token)
        const profileRes = await getUserProfile()

        // Step 4 — Save everything to Zustand store
        setAuth(profileRes.data, access, refresh)

        // Step 5 — Redirect based on role
        const role = profileRes.data.role
        navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')

    } catch (err) {
        setError('Invalid username or password.')
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
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your Medlink account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                        <div className="text-right mt-1">
                            <span className="text-xs text-indigo-600 cursor-pointer hover:underline">
                                Forgot password?
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login