import api from './axios'

export const getCategories = () => api.get('/pharmacy/categories/')
export const getMedicines = (params) => api.get('/pharmacy/medicines/', { params })
export const getMedicineDetail = (id) => api.get(`/pharmacy/medicines/${id}/`)
export const getCart = () => api.get('/pharmacy/cart/')
export const addToCart = (medicine_id, quantity = 1) => api.post('/pharmacy/cart/', { medicine_id, quantity })
export const updateCartItem = (item_id, quantity) => api.patch(`/pharmacy/cart/items/${item_id}/`, { quantity })
export const removeCartItem = (item_id) => api.delete(`/pharmacy/cart/items/${item_id}/`)
export const clearCart = () => api.delete('/pharmacy/cart/')
export const checkout = (data) => api.post('/pharmacy/checkout/', data)
export const getOrders = () => api.get('/pharmacy/orders/')
export const getOrderDetail = (id) => api.get(`/pharmacy/orders/${id}/`)