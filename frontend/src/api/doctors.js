// src/api/doctors.js
import api from './axios'

export const getDoctors = (specialization) =>
    api.get('/doctors/', { params: specialization ? { specialization } : {} })
export const getDoctorDetail = (id) => api.get(`/doctors/${id}/`)
export const getSpecializations = () => api.get('/doctors/specializations/')
export const getDoctorProfile = () => api.get('/doctors/profile/')
export const updateDoctorProfile = (data) => api.patch('/doctors/profile/', data)
export const uploadProfilePicture = (formData) => api.patch('/auth/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
})