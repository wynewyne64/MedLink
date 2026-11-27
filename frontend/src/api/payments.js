import api from './axios'

export const initiatePayment = (data) => api.post('/payments/initiate/', data)
export const confirmPayment = (paymentId) => api.post(`/payments/${paymentId}/confirm/`)
export const getPayments = () => api.get('/payments/')