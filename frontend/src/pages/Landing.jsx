// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import doctorGroup from '../assets/doctor-group.jpg'
const Landing = () => {
    const navigate = useNavigate()
    const [openFaq, setOpenFaq] = useState(null)

    const features = [
        {
            icon: '👨‍⚕️',
            title: 'Expert Doctors',
            desc: 'Connect with verified, experienced doctors across all specializations from the comfort of your home.'
        },
        {
            icon: '📅',
            title: 'Easy Appointments',
            desc: 'Book video or chat consultations in seconds. No waiting rooms, no long queues.'
        },
        {
            icon: '💊',
            title: 'Online Pharmacy',
            desc: 'Order prescribed and over-the-counter medicines and get them delivered to your door.'
        },
        {
            icon: '📋',
            title: 'Medical Records',
            desc: 'All your diagnoses, prescriptions and medical history stored securely in one place.'
        },
        {
            icon: '🔔',
            title: 'Smart Notifications',
            desc: 'Get timely reminders for appointments, medication and follow-ups.'
        },
        {
            icon: '🔒',
            title: 'Private & Secure',
            desc: 'Your health data is encrypted and protected. Only you and your doctor can access it.'
        }
    ]

    const stats = [
        { value: '500+', label: 'Verified Doctors' },
        { value: '10,000+', label: 'Patients Served' },
        { value: '50+', label: 'Specializations' },
        { value: '24/7', label: 'Available Support' }
    ]

    const faqs = [
        {
            q: 'How do I book an appointment?',
            a: 'Create an account, choose a doctor, pick a time, and confirm your booking.'
        },
        {
            q: 'Are doctors verified?',
            a: 'Yes, all doctors go through strict verification before joining.'
        },
        {
            q: 'Can I get prescriptions online?',
            a: 'Yes, doctors can issue digital prescriptions after consultation.'
        },
        {
            q: 'Is my data safe?',
            a: 'Yes, all data is encrypted and securely stored.'
        }
    ]

    return (
        <div className="min-h-screen bg-white">

            {/* NAVBAR */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg">🏥</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">Medlink</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-4 py-2"
                        >
                            Sign In
                        </button>

                        <button
                            onClick={() => navigate('/register')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="bg-gradient-to-b from-indigo-50 via-white to-white py-16 px-4">

                <div className="max-w-6xl mx-auto text-center">

                    <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm px-4 py-2 rounded-full mb-6">
                        🇰🇪 Kenya's trusted telemedicine platform
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-5">
                        Healthcare made <span className="text-indigo-600">simple</span>, fast & accessible
                    </h1>

                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
                        Connect with doctors, book appointments, manage records, and order medicine — all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl"
                        >
                            Get Started Free →
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            className="bg-white border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50"
                        >
                            Sign In
                        </button>
                    </div>

                    {/* CENTER IMAGE */}
                    <div className="max-w-5xl mx-auto relative">
                        <img src={doctorGroup} alt="Doctors team" />

                        <div className="hidden md:block absolute -bottom-5 left-8 bg-white shadow-md px-4 py-2 rounded-xl border">
                            👨‍⚕️ 500+ Verified Doctors
                        </div>

                        <div className="hidden md:block absolute -bottom-5 right-8 bg-white shadow-md px-4 py-2 rounded-xl border">
                            💊 Online Pharmacy
                        </div>
                    </div>

                </div>
            </section>

            {/* STATS */}
            <section className="bg-indigo-600 py-12">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
                    {stats.map((s) => (
                        <div key={s.label}>
                            <p className="text-3xl font-bold">{s.value}</p>
                            <p className="text-sm text-indigo-200">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Everything you need
                    </h2>
                    <p className="text-gray-500">
                        All your healthcare tools in one platform
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((f) => (
                        <div key={f.title} className="p-6 border rounded-2xl hover:shadow-md transition">
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                            <p className="text-gray-500 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-gray-400 py-10 text-center">
                <p>© 2026 Medlink. All rights reserved.</p>
            </footer>

        </div>
    )
}

export default Landing