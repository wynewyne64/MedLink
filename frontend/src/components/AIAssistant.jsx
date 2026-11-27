// src/components/AIAssistant.jsx
import { useState, useRef, useEffect } from 'react'
import { sendAIMessage } from '../api/ai'
import useAuthStore from '../store/authStore'

const modeConfig = {
    symptom_checker: {
        name: 'Symptom Checker',
        icon: '🩺',
        color: 'bg-red-500',
        placeholder: 'Describe your symptoms...',
        greeting: "Hi! I'm Medlink's Symptom Checker. Describe your symptoms and I'll help you understand what might be going on and which doctor to see.",
    },
    medical_assistant: {
        name: 'Medical Assistant',
        icon: '💬',
        color: 'bg-indigo-500',
        placeholder: 'Ask a health question...',
        greeting: "Hello! I'm your Medlink Medical Assistant. I can answer health questions, explain medical terms and give wellness advice. How can I help you today?",
    },
    doctor_assistant: {
        name: 'Doctor Assistant',
        icon: '🔬',
        color: 'bg-teal-500',
        placeholder: 'Ask about diagnosis, treatment...',
        greeting: "Hello Doctor! I'm your AI clinical assistant. I can help with differential diagnoses, treatment protocols, drug information and writing medical notes. How can I assist you?",
    },
}

const AIAssistant = () => {
    const { user } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [mode, setMode] = useState('medical_assistant')
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [showModeSelector, setShowModeSelector] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const isDoctor = user?.role === 'doctor'

    // Available modes based on role
    const availableModes = isDoctor
        ? ['doctor_assistant', 'medical_assistant']
        : ['symptom_checker', 'medical_assistant']

    // Set default mode based on role
    useEffect(() => {
        if (isDoctor) setMode('doctor_assistant')
        else setMode('symptom_checker')
    }, [isDoctor])

    // Add greeting when mode changes or chat opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: modeConfig[mode].greeting,
                id: Date.now(),
            }])
        }
    }, [isOpen, mode])

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleModeChange = (newMode) => {
        setMode(newMode)
        setMessages([{
            role: 'assistant',
            content: modeConfig[newMode].greeting,
            id: Date.now(),
        }])
        setShowModeSelector(false)
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')

        // Add user message
        const newMessages = [...messages, {
            role: 'user',
            content: userMessage,
            id: Date.now(),
        }]
        setMessages(newMessages)
        setLoading(true)

        try {
            // Build history for API (exclude greeting and local ids)
            const history = newMessages
                .slice(1) // skip greeting
                .slice(0, -1) // skip latest user message
                .map(({ role, content }) => ({ role, content }))

            const res = await sendAIMessage(mode, userMessage, history)

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.response,
                id: Date.now(),
            }])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I am temporarily unavailable. Please try again in a moment.',
                id: Date.now(),
                isError: true,
            }])
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: modeConfig[mode].greeting,
            id: Date.now(),
        }])
    }

    if (!user) return null

    const config = modeConfig[mode]

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center text-2xl transition-all hover:scale-110"
                >
                    🤖
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
                </button>
            )}

            {/* Chat window */}
            {isOpen && (
                <div className={`fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl flex flex-col transition-all ${isMinimized ? 'h-16' : 'h-[600px]'}`}>

                    {/* Header */}
                    <div className={`${config.color} rounded-t-2xl p-4 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">
                                {config.icon}
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">{config.name}</p>
                                <p className="text-white/70 text-xs">Medlink AI</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Mode selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowModeSelector(!showModeSelector)}
                                    className="text-white/80 hover:text-white text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors"
                                >
                                    Switch ▾
                                </button>
                                {showModeSelector && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl overflow-hidden w-52">
                                        {availableModes.map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => handleModeChange(m)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left ${mode === m ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}
                                            >
                                                <span>{modeConfig[m].icon}</span>
                                                <span>{modeConfig[m].name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="text-white/80 hover:text-white transition-colors text-lg w-7 h-7 flex items-center justify-center"
                            >
                                {isMinimized ? '▲' : '▼'}
                            </button>
                            <button
                                onClick={() => { setIsOpen(false); setIsMinimized(false) }}
                                className="text-white/80 hover:text-white transition-colors text-lg w-7 h-7 flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className={`w-7 h-7 ${config.color} rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1`}>
                                                {config.icon}
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                    : msg.isError
                                                        ? 'bg-red-50 text-red-600 rounded-tl-sm'
                                                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                                            }`}
                                        >
                                            {/* Render message with line breaks */}
                                            {msg.content.split('\n').map((line, i) => (
                                                <span key={i}>
                                                    {line}
                                                    {i < msg.content.split('\n').length - 1 && <br />}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Loading indicator */}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className={`w-7 h-7 ${config.color} rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2`}>
                                            {config.icon}
                                        </div>
                                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick prompts */}
                            {messages.length === 1 && (
                                <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                                    {(mode === 'symptom_checker'
                                        ? ['I have a headache', 'Fever and chills', 'Chest pain']
                                        : mode === 'medical_assistant'
                                            ? ['What is hypertension?', 'How to lower BP?', 'Healthy diet tips']
                                            : ['Differential for fever', 'Antibiotic dosing', 'Write a SOAP note']
                                    ).map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                                            className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex-shrink-0"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex gap-2 items-end">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={config.placeholder}
                                        rows={1}
                                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-24"
                                        style={{ minHeight: '40px' }}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
                                    >
                                        ➤
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-400">Press Enter to send</p>
                                    <button
                                        onClick={clearChat}
                                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Clear chat
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export default AIAssistant