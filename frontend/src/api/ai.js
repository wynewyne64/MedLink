import api from './axios'

export const sendAIMessage = (mode, message, history) =>
    api.post('/ai/chat/', { mode, message, history })