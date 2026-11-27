import api from './axios'

export const registerUser = (data) => api.post('/auth/register/', data)
export const loginUser = (data) => api.post('/auth/login/', data)
export const logoutUser = (data) => api.post('/auth/logout/', data)
export const getProfile = () => api.get('/auth/profile/')
export const getUserProfile = () => api.get('/auth/profile/')
export const updateProfile = (data) => api.patch('/auth/profile/', data)