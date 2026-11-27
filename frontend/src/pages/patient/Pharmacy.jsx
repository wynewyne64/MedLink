import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders } from '../../api/pharmacy'
import {
    getCategories, getMedicines, getCart,
    addToCart, updateCartItem, removeCartItem, checkout
} from '../../api/pharmacy'

const Pharmacy = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [medicines, setMedicines] = useState([])
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [cartLoading, setCartLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [showCart, setShowCart] = useState(false)
    const [activeTab, setActiveTab] = useState('shop')
    const [orders, setOrders] = useState([])
    const [toast, setToast] = useState('')
    const [checkoutForm, setCheckoutForm] = useState({
        delivery_address: '',
        phone_number: '',
        notes: '',
    })
    const [checkoutStep, setCheckoutStep] = useState('cart') // cart → form → success
    const [orderResult, setOrderResult] = useState(null)
    const [placingOrder, setPlacingOrder] = useState(false)
    const [addingToCart, setAddingToCart] = useState(null)

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        fetchMedicines()
    }, [selectedCategory, search])

    const fetchInitialData = async () => {
        try {
            const [catRes, medRes, cartRes] = await Promise.all([
                getCategories(),
                getMedicines(),
                getCart(),
            ])
            setCategories(catRes.data)
            setMedicines(medRes.data)
            setCart(cartRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMedicines = async () => {
        try {
            const params = {}
            if (selectedCategory) params.category = selectedCategory
            if (search) params.search = search
            const res = await getMedicines(params)
            setMedicines(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchInput)
    }

    const handleAddToCart = async (medicineId) => {
        setAddingToCart(medicineId)
        try {
            const res = await addToCart(medicineId, 1)
            setCart(res.data)
            showToast('Added to cart 🛒')
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to add to cart')
        } finally {
            setAddingToCart(null)
        }
    }

    const handleUpdateQuantity = async (itemId, quantity) => {
        setCartLoading(true)
        try {
            const res = await updateCartItem(itemId, quantity)
            setCart(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setCartLoading(false)
        }
    }

    const handleRemoveItem = async (itemId) => {
        setCartLoading(true)
        try {
            const res = await removeCartItem(itemId)
            setCart(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setCartLoading(false)
        }
    }

    const handleCheckout = async (e) => {
        e.preventDefault()
        setPlacingOrder(true)
        try {
            const res = await checkout(checkoutForm)
            setOrderResult(res.data)
            setCheckoutStep('success')
            // Refresh cart
            const cartRes = await getCart()
            setCart(cartRes.data)
        } catch (err) {
            showToast(err.response?.data?.error || 'Checkout failed')
        } finally {
            setPlacingOrder(false)
        }
    }

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(''), 3000)
    }

    const cartItemCount = cart?.item_count || 0

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-indigo-100 text-indigo-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading pharmacy...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
                    {toast}
                </div>
            )}

            {/* Cart Sidebar */}
            {showCart && (
                <div className="fixed inset-0 z-40 flex justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCart(false); setCheckoutStep('cart') }} />
                    <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col">

                        {/* Cart header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900 text-lg">
                                🛒 Your Cart
                                {cartItemCount > 0 && (
                                    <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                                        {cartItemCount}
                                    </span>
                                )}
                            </h2>
                            <button
                                onClick={() => { setShowCart(false); setCheckoutStep('cart') }}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Cart content */}
                        <div className="flex-1 overflow-y-auto p-5">

                            {/* Empty cart */}
                            {cartItemCount === 0 && checkoutStep === 'cart' && (
                                <div className="text-center py-16">
                                    <p className="text-5xl mb-3">🛒</p>
                                    <p className="text-gray-600 font-medium">Your cart is empty</p>
                                    <p className="text-gray-400 text-sm mt-1">Add medicines to get started</p>
                                </div>
                            )}

                            {/* Cart items */}
                            {checkoutStep === 'cart' && cartItemCount > 0 && (
                                <div className="space-y-4">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                                            {/* Medicine image */}
                                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-indigo-100 flex-shrink-0">
                                                {item.medicine.image_url ? (
                                                    <img src={item.medicine.image_url} alt={item.medicine.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.medicine.name}</p>
                                                <p className="text-xs text-gray-500">{item.medicine.unit}</p>
                                                <p className="text-sm font-bold text-indigo-600 mt-1">KES {item.subtotal}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-400 hover:text-red-600 text-xs"
                                                >
                                                    ✕
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-bold flex items-center justify-center"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full text-sm font-bold flex items-center justify-center"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Checkout form */}
                            {checkoutStep === 'form' && (
                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <h3 className="font-semibold text-gray-900">Delivery Details</h3>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                                        <textarea
                                            value={checkoutForm.delivery_address}
                                            onChange={(e) => setCheckoutForm({ ...checkoutForm, delivery_address: e.target.value })}
                                            required
                                            rows={3}
                                            placeholder="Enter your full delivery address..."
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            value={checkoutForm.phone_number}
                                            onChange={(e) => setCheckoutForm({ ...checkoutForm, phone_number: e.target.value })}
                                            required
                                            placeholder="0712345678"
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                                        <input
                                            value={checkoutForm.notes}
                                            onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                                            placeholder="Any special instructions..."
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Order summary */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Order Summary</p>
                                        {cart.items.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">{item.medicine.name} x{item.quantity}</span>
                                                <span className="font-medium">KES {item.subtotal}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                                            <span className="font-bold text-gray-900">Total</span>
                                            <span className="font-bold text-indigo-600">KES {cart.total}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCheckoutStep('cart')}
                                            className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={placingOrder}
                                            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {placingOrder ? 'Placing...' : 'Place Order'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Success */}
                            {checkoutStep === 'success' && orderResult && (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h3>
                                    <p className="text-gray-500 text-sm mb-6">Your medicines are on their way</p>

                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                                        <p className="text-xs font-semibold text-green-700 uppercase mb-3">🧾 Order Receipt</p>
                                        {[
                                            { label: 'Order ID', value: `#${orderResult.id}` },
                                            { label: 'Transaction', value: orderResult.transaction_code },
                                            { label: 'Total', value: `KES ${orderResult.total_amount}` },
                                            { label: 'Status', value: '✅ Confirmed' },
                                            { label: 'Delivery', value: orderResult.delivery_address },
                                        ].map(item => (
                                            <div key={item.label} className="flex justify-between py-1.5 border-b border-green-100 last:border-0">
                                                <span className="text-xs text-gray-500">{item.label}</span>
                                                <span className="text-xs font-semibold text-gray-900 text-right max-w-[60%]">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => { setShowCart(false); setCheckoutStep('cart'); setActiveTab('orders') }}
                                        className="mt-4 w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700"
                                    >
                                        View My Orders
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Cart footer */}
                        {checkoutStep === 'cart' && cartItemCount > 0 && (
                            <div className="p-5 border-t border-gray-100">
                                <div className="flex justify-between mb-4">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="font-bold text-indigo-600 text-lg">KES {cart.total}</span>
                                </div>
                                <button
                                    onClick={() => setCheckoutStep('form')}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors"
                                >
                                    Proceed to Checkout →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/patient/dashboard')} className="text-gray-500 hover:text-gray-700 text-sm">
                            ← Dashboard
                        </button>
                        <div className="w-px h-5 bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">💊</span>
                            </div>
                            <span className="font-bold text-gray-900">Medlink Pharmacy</span>
                        </div>
                    </div>

                    {/* Cart button */}
                    <button
                        onClick={() => setShowCart(true)}
                        className="relative flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl transition-colors"
                    >
                        <span>🛒</span>
                        <span className="text-sm font-medium">Cart</span>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-6">

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
                    {[
                        { key: 'shop', label: '🏪 Shop' },
                        { key: 'orders', label: '📦 My Orders' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.key
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── SHOP TAB ── */}
                {activeTab === 'shop' && (
                    <div>
                        {/* Hero banner */}
                        <div className="bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl p-6 mb-6 text-white">
                            <h1 className="text-2xl font-bold mb-1">Medlink Pharmacy 💊</h1>
                            <p className="text-indigo-100 text-sm">Quality medicines delivered to your door</p>
                        </div>

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="mb-6">
                            <div className="flex gap-2">
                                <input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search medicines..."
                                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Search
                                </button>
                                {(search || selectedCategory) && (
                                    <button
                                        type="button"
                                        onClick={() => { setSearch(''); setSearchInput(''); setSelectedCategory(null) }}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Categories */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                    !selectedCategory
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                                }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                    {cat.icon} {cat.name}
                                    <span className="ml-1 opacity-60 text-xs">({cat.medicine_count})</span>
                                </button>
                            ))}
                        </div>

                        {/* Results count */}
                        <p className="text-sm text-gray-500 mb-4">
                            {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} found
                            {search && ` for "${search}"`}
                        </p>

                        {/* Medicine cards grid */}
                        {medicines.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                                <p className="text-5xl mb-4">🔍</p>
                                <p className="text-gray-700 font-medium">No medicines found</p>
                                <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {medicines.map((medicine) => (
                                    <div key={medicine.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">

                                        {/* Medicine image */}
                                        <div className="w-full h-40 bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden">
                                            {medicine.image_url ? (
                                                <img
                                                    src={medicine.image_url}
                                                    alt={medicine.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-5xl">
                                                    💊
                                                </div>
                                            )}
                                            {/* Badges */}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                {medicine.requires_prescription && (
                                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Rx
                                                    </span>
                                                )}
                                                {medicine.stock <= 5 && medicine.stock > 0 && (
                                                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Low stock
                                                    </span>
                                                )}
                                                {medicine.stock === 0 && (
                                                    <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Out of stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Medicine details */}
                                        <div className="p-4">
                                            <p className="text-xs text-indigo-600 font-medium mb-1">
                                                {medicine.category?.icon} {medicine.category?.name}
                                            </p>
                                            <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                                                {medicine.name}
                                            </h3>
                                            {medicine.manufacturer && (
                                                <p className="text-xs text-gray-400 mb-2">{medicine.manufacturer}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                                {medicine.description}
                                            </p>
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="font-bold text-gray-900">KES {medicine.price}</p>
                                                    <p className="text-xs text-gray-400">{medicine.unit}</p>
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {medicine.stock > 0 ? `${medicine.stock} left` : 'Out of stock'}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(medicine.id)}
                                                disabled={medicine.stock === 0 || addingToCart === medicine.id}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                {addingToCart === medicine.id ? '...' : medicine.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ORDERS TAB ── */}
                {activeTab === 'orders' && (
                    <OrdersTab />
                )}
            </div>
        </div>
    )
}

// Orders tab as separate component
const OrdersTab = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)

    useEffect(() => {
        getOrders()
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-indigo-100 text-indigo-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    }

    const statusIcons = {
        pending: '⏳',
        confirmed: '✅',
        processing: '⚙️',
        shipped: '🚚',
        delivered: '📦',
        cancelled: '❌',
    }

    if (loading) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (orders.length === 0) return (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-700 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-1">Your pharmacy orders will appear here</p>
        </div>
    )

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div
                        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-gray-900">Order #{order.id}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                                        {statusIcons[order.status]} {order.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('en-KE', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Ref: {order.transaction_code}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-indigo-600">KES {order.total_amount}</p>
                                <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
                                <p className="text-xs text-gray-400 mt-1">{expanded === order.id ? '▲' : '▼'}</p>
                            </div>
                        </div>
                    </div>

                    {expanded === order.id && (
                        <div className="px-5 pb-5 border-t border-gray-100">
                            <div className="pt-4 space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-indigo-50 flex-shrink-0">
                                            {item.medicine.image_url ? (
                                                <img src={item.medicine.image_url} alt={item.medicine.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">💊</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.medicine.name}</p>
                                            <p className="text-xs text-gray-500">x{item.quantity} @ KES {item.price}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">KES {item.subtotal}</p>
                                    </div>
                                ))}

                                <div className="border-t border-gray-100 pt-3 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery to</span>
                                        <span className="text-gray-900 text-right max-w-[60%] text-xs">{order.delivery_address}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="text-gray-900">{order.phone_number}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-indigo-600">KES {order.total_amount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default Pharmacy