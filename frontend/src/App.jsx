import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PatientDashboard from './pages/patient/Dashboard'
import BookAppointment from './pages/patient/BookAppointment'
import PatientProfile from './pages/patient/Profile'
import MedicalRecords from './pages/patient/MedicalRecords'
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorProfile from './pages/doctor/Profile'
import Notifications from './pages/Notifications'
import Payments from './pages/patient/Payments'
import CreateMedicalRecord from './pages/doctor/CreateMedicalRecord'
import Pharmacy from './pages/patient/Pharmacy'
import Landing from './pages/Landing'
import AIAssistant from './components/AIAssistant'

const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuthStore()
    if (!user) return <Navigate to="/login" />
    if (role && user.role !== role) return <Navigate to="/login" />
    return children
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Patient routes */}
                <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/book/:doctorId" element={<ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>} />
                <Route path="/patient/profile" element={<ProtectedRoute role="patient"><PatientProfile /></ProtectedRoute>} />
                <Route path="/patient/records" element={<ProtectedRoute role="patient"><MedicalRecords /></ProtectedRoute>} />

                 <Route path="/patient/payments" element={
                      <ProtectedRoute role="patient">
                          <Payments />
                      </ProtectedRoute>
                 } />

                 <Route path="/doctor/records/create/:appointmentId" element={
                       <ProtectedRoute role="doctor">
                         <CreateMedicalRecord />
                       </ProtectedRoute>
                 } />

                 <Route path="/patient/pharmacy" element={
                       <ProtectedRoute role="patient">
                           <Pharmacy />
                       </ProtectedRoute>
                 } />



                {/* Doctor routes */}
                <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
                <Route path="/doctor/profile" element={<ProtectedRoute role="doctor"><DoctorProfile /></ProtectedRoute>} />

                {/* Shared routes */}
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
            <AIAssistant />
        </BrowserRouter>
    )
}

export default App