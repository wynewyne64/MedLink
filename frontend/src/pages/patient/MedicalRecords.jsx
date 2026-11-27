// src/pages/patient/MedicalRecords.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyRecords } from '../../api/records'

const MedicalRecords = () => {
    const navigate = useNavigate()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)

    useEffect(() => {
        getMyRecords()
            .then(res => setRecords(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

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
                        <span className="font-bold text-gray-900">Medical Records</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-6">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">My Medical Records</h1>
                        <p className="text-sm text-gray-500">{records.length} records found</p>
                    </div>
                </div>

                {records.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <p className="text-5xl mb-4">📋</p>
                        <p className="text-gray-700 font-medium">No medical records yet</p>
                        <p className="text-gray-500 text-sm mt-1">Your records will appear here after a consultation</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {records.map((record) => (
                            <div key={record.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                                {/* Record header */}
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpanded(expanded === record.id ? null : record.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg">
                                                📋
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{record.diagnosis}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(record.created_at).toLocaleDateString('en-KE', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {record.prescriptions?.length > 0 && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    💊 {record.prescriptions.length} prescription(s)
                                                </span>
                                            )}
                                            <span className="text-gray-400 text-sm">
                                                {expanded === record.id ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {expanded === record.id && (
                                    <div className="px-5 pb-5 border-t border-gray-100">
                                        <div className="pt-4 space-y-4">

                                            {/* Treatment */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Treatment</p>
                                                <p className="text-sm text-gray-800">{record.treatment}</p>
                                            </div>

                                            {/* Notes */}
                                            {record.notes && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Doctor's Notes</p>
                                                    <p className="text-sm text-gray-800 italic">"{record.notes}"</p>
                                                </div>
                                            )}

                                            {/* Prescriptions */}
                                            {record.prescriptions?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prescriptions</p>
                                                    <div className="space-y-2">
                                                        {record.prescriptions.map((p) => (
                                                            <div key={p.id} className="bg-green-50 rounded-xl p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <p className="font-semibold text-gray-900 text-sm">💊 {p.medication_name}</p>
                                                                    <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                                                                        {p.duration}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                                    <span>📏 Dosage: <strong>{p.dosage}</strong></span>
                                                                    <span>🔁 Frequency: <strong>{p.frequency}</strong></span>
                                                                </div>
                                                                {p.instructions && (
                                                                    <p className="text-xs text-gray-500 mt-2 italic">{p.instructions}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MedicalRecords