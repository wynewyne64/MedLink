import api from './axios'

export const getMyRecords = () => api.get('/prescriptions/records/')
export const getRecordDetail = (id) => api.get(`/prescriptions/records/${id}/`)
export const createMedicalRecord = (data) => api.post('/prescriptions/records/create/', data)