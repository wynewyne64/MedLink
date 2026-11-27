// src/pages/patient/Payments.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyAppointments } from '../../api/appointments'
import { initiatePayment, confirmPayment, getPayments } from '../../api/payments'

const Payments = () => {
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pay')
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('mpesa')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [step, setStep] = useState('select') // select → processing → success
    const [currentPayment, setCurrentPayment] = useState(null)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apptRes, payRes] = await Promise.all([
                    getMyAppointments(),
                    getPayments(),
                ])
                // Only show confirmed unpaid appointments
                const unpaid = apptRes.data.filter(a =>
                   ['confirmed', 'pending'].includes(a.status)
                )
                setAppointments(unpaid)
                setPayments(payRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleInitiatePayment = async () => {
        if (!selectedAppointment) return
        setProcessing(true)
        try {
            const res = await initiatePayment({
                appointment_id: selectedAppointment.id,
                payment_method: paymentMethod,
                phone_number: phoneNumber,
            })
            setCurrentPayment(res.data)
            setStep('processing')
        } catch (err) {
            console.error(err)
        } finally {
            setProcessing(false)
        }
    }

    const handleConfirmPayment = async () => {
        if (!currentPayment) return
        setProcessing(true)
        try {
            const res = await confirmPayment(currentPayment.id)
            setCurrentPayment(res.data.payment)
            setStep('success')
            // Refresh payments list
            const payRes = await getPayments()
            setPayments(payRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setProcessing(false)
        }
    }

    const resetPayment = () => {
        setStep('select')
        setSelectedAppointment(null)
        setCurrentPayment(null)
        setPhoneNumber('')
    }

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        refunded: 'bg-gray-100 text-gray-600',
    }

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
                    <button onClick={() => navigate('/patient/dashboard')} className="text-gray-500 hover:text-gray-700 text-sm">
                        ← Dashboard
                    </button>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🏥</span>
                        </div>
                        <span className="font-bold text-gray-900">Payments</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
                    {['pay', 'history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); resetPayment() }}
                            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                activeTab === tab
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'pay' ? '💳 Make Payment' : '🧾 History'}
                        </button>
                    ))}
                </div>

                {/* ── PAY TAB ── */}
                {activeTab === 'pay' && (
                    <div>

                        {/* STEP 1 — Select appointment */}
                        {step === 'select' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="font-semibold text-gray-900 mb-1">Select Appointment</h2>
                                    <p className="text-xs text-gray-500 mb-4">Only confirmed appointments are shown</p>

                                    {appointments.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-4xl mb-2">✅</p>
                                            <p className="text-gray-600 font-medium">No pending payments</p>
                                            <p className="text-gray-400 text-sm mt-1">All your appointments are paid for</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {appointments.map((appt) => (
                                                <div
                                                    key={appt.id}
                                                    onClick={() => setSelectedAppointment(appt)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                        selectedAppointment?.id === appt.id
                                                            ? 'border-indigo-500 bg-indigo-50'
                                                            : 'border-gray-100 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                Dr. {appt.doctor?.user?.first_name} {appt.doctor?.user?.last_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {appt.appointment_date} • {appt.appointment_time}
                                                            </p>
                                                            <p className="text-xs text-indigo-500 mt-0.5">
                                                                {appt.consultation_type} consultation
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-900">
                                                                KES {appt.doctor?.consultation_fee}
                                                            </p>
                                                            {selectedAppointment?.id === appt.id && (
                                                                <span className="text-xs text-indigo-600">✓ Selected</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Payment method */}
                                {selectedAppointment && (
                                    <div className="bg-white rounded-2xl shadow-sm p-6">
                                        <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            {[
                                                { value: 'mpesa', label: '📱 M-Pesa', desc: 'Pay via mobile money' },
                                                { value: 'stripe', label: '💳 Card', desc: 'Pay with debit/credit' },
                                            ].map((method) => (
                                                <div
                                                    key={method.value}
                                                    onClick={() => setPaymentMethod(method.value)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                        paymentMethod === method.value
                                                            ? 'border-indigo-500 bg-indigo-50'
                                                            : 'border-gray-100 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {paymentMethod === 'mpesa' && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
                                                <input
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="e.g. 0712345678"
                                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        )}

                                        {/* Summary */}
                                        <div className="mt-4 bg-gray-50 rounded-xl p-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">Consultation fee</span>
                                                <span className="font-medium">KES {selectedAppointment.doctor?.consultation_fee}</span>
                                            </div>
                                            <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                                                <span className="font-semibold text-gray-900">Total</span>
                                                <span className="font-bold text-indigo-600">KES {selectedAppointment.doctor?.consultation_fee}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleInitiatePayment}
                                            disabled={processing || (paymentMethod === 'mpesa' && !phoneNumber)}
                                            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {processing ? 'Please wait...' : `Pay KES ${selectedAppointment.doctor?.consultation_fee}`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2 — Processing / Confirm */}
                        {step === 'processing' && currentPayment && (
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">
                                        {paymentMethod === 'mpesa' ? '📱' : '💳'}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    {paymentMethod === 'mpesa' ? 'Check your phone' : 'Confirm Payment'}
                                </h2>
                                <p className="text-gray-500 text-sm mb-6">
                                    {paymentMethod === 'mpesa'
                                        ? `An M-Pesa prompt has been sent to ${phoneNumber}. Enter your PIN to complete payment.`
                                        : 'Click the button below to complete your card payment.'
                                    }
                                </p>

                                {/* Payment summary */}
                                <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500">Amount</span>
                                        <span className="font-bold text-gray-900">KES {currentPayment.amount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500">Doctor</span>
                                        <span className="font-medium text-gray-900">{currentPayment.doctor_name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Method</span>
                                        <span className="font-medium text-gray-900 capitalize">{currentPayment.payment_method}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={processing}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : '✅ I have paid / Confirm Payment'}
                                </button>

                                <button
                                    onClick={resetPayment}
                                    className="mt-3 w-full text-gray-500 hover:text-gray-700 text-sm py-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* STEP 3 — Success */}
                        {step === 'success' && currentPayment && (
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">🎉</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                                <p className="text-gray-500 text-sm mb-6">
                                    Your payment has been confirmed. Your appointment is all set!
                                </p>

                                {/* Receipt */}
                                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-left mb-6">
                                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
                                        🧾 Payment Receipt
                                    </p>
                                    {[
                                        { label: 'Transaction Code', value: currentPayment.transaction_code },
                                        { label: 'Amount Paid', value: `KES ${currentPayment.amount}` },
                                        { label: 'Doctor', value: currentPayment.doctor_name },
                                        { label: 'Payment Method', value: currentPayment.payment_method?.toUpperCase() },
                                        { label: 'Date', value: new Date(currentPayment.paid_at).toLocaleString('en-KE') },
                                        { label: 'Status', value: '✅ Completed' },
                                    ].map((item) => (
                                        <div key={item.label} className="flex justify-between py-1.5 border-b border-green-100 last:border-0">
                                            <span className="text-xs text-gray-500">{item.label}</span>
                                            <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={resetPayment}
                                        className="flex-1 bg-indigo-50 text-indigo-600 font-medium py-2.5 rounded-xl hover:bg-indigo-100 transition-colors text-sm"
                                    >
                                        Make Another Payment
                                    </button>
                                    <button
                                        onClick={() => navigate('/patient/dashboard')}
                                        className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── HISTORY TAB ── */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
                        {payments.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-4xl mb-3">🧾</p>
                                <p className="text-gray-600 font-medium">No payments yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                                                {payment.payment_method === 'mpesa' ? '📱' : '💳'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{payment.doctor_name}</p>
                                                <p className="text-xs text-gray-500">{payment.transaction_code || 'Pending'}</p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(payment.created_at).toLocaleDateString('en-KE')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-sm">KES {payment.amount}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[payment.status]}`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Payments