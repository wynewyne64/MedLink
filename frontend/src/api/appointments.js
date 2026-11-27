import api from './axios'

export const bookAppointment = (data) => api.post('/appointments/book/', data)
export const getMyAppointments = () => api.get('/appointments/my/')
export const getDoctorAppointments = () => api.get('/appointments/doctor/my/')
export const getAppointmentDetail = (id) => api.get(`/appointments/${id}/`)
export const cancelAppointment = (id) => api.post(`/appointments/${id}/cancel/`)
export const updateAppointment = (id, data) => api.patch(`/appointments/${id}/`, data)