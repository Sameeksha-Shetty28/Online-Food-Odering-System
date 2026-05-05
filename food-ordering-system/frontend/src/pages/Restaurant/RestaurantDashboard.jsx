import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([])
  const [foods, setFoods] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddFood, setShowAddFood] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [newFood, setNewFood] = useState({
    name: '',
    price: '',
    category: 'Lunch',
    description: '',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300',
    is_available: true,
    meal_type: 'lunch',
    rating: 4.0
  })
  const navigate = useNavigate()
  const restaurant = JSON.parse(localStorage.getItem('restaurant') || '{}')

  useEffect(() => {
    checkAuth()
    fetchOrders()
    fetchFoods()
    fetchStats()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('restaurant_token')
    if (!token) {
      navigate('/restaurant/login')
    }
  }

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('restaurant_token')}` }
  })

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/restaurant/orders', getAuthHeaders())
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/restaurant/foods', getAuthHeaders())
      setFoods(response.data.foods)
    } catch (error) {
      console.error('Error fetching foods:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/restaurant/stats', getAuthHeaders())
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8000/api/restaurant/orders/${orderId}/status?status=${newStatus}`,
        {},
        getAuthHeaders()
      )
      fetchOrders()
      fetchStats()
      alert(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }

  const handleAddFood = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/api/restaurant/foods', newFood, getAuthHeaders())
      alert('Food added successfully!')
      setShowAddFood(false)
      setNewFood({
        name: '',
        price: '',
        category: 'Lunch',
        description: '',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300',
        is_available: true,
        meal_type: 'lunch',
        rating: 4.0
      })
      fetchFoods()
    } catch (error) {
      console.error('Error adding food:', error)
      alert('Failed to add food')
    }
  }

  const handleUpdateFood = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:8000/api/restaurant/foods/${editingFood.id}`, editingFood, getAuthHeaders())
      alert('Food updated successfully!')
      setEditingFood(null)
      fetchFoods()
    } catch (error) {
      console.error('Error updating food:', error)
      alert('Failed to update food')
    }
  }

  const handleDeleteFood = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        await axios.delete(`http://localhost:8000/api/restaurant/foods/${foodId}`, getAuthHeaders())
        alert('Food deleted successfully!')
        fetchFoods()
      } catch (error) {
        console.error('Error deleting food:', error)
        alert('Failed to delete food')
      }
    }
  }

  const toggleAvailability = async (foodId, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/restaurant/foods/${foodId}/availability?is_available=${!currentStatus}`,
        {},
        getAuthHeaders()
      )
      fetchFoods()
    } catch (error) {
      console.error('Error toggling availability:', error)
      alert('Failed to update availability')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'confirmed': 'bg-blue-500',
      'preparing': 'bg-purple-500',
      'out_for_delivery': 'bg-orange-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': '⏳ Pending',
      'confirmed': '✅ Confirmed',
      'preparing': '🍳 Preparing',
      'out_for_delivery': '🚚 Out for Delivery',
      'delivered': '🎉 Delivered',
      'cancelled': '❌ Cancelled'
    }
    return texts[status] || status
  }

  const getNextStatuses = (currentStatus) => {
    const flow = {
      'pending': [{ status: 'confirmed', label: 'Confirm Order', color: 'bg-blue-500' }],
      'confirmed': [{ status: 'preparing', label: 'Start Preparing', color: 'bg-purple-500' }],
      'preparing': [{ status: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-500' }],
      'out_for_delivery': [{ status: 'delivered', label: 'Mark Delivered', color: 'bg-green-500' }],
      'delivered': [],
      'cancelled': []
    }
    return flow[currentStatus] || []
  }

  const handleLogout = () => {
    localStorage.removeItem('restaurant_token')
    localStorage.removeItem('restaurant')
    navigate('/restaurant/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-green-900 to-green-800 text-white shadow-xl overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-green-400">Restaurant Hub</h2>
          <p className="text-sm text-gray-300 mt-1">{restaurant.name}</p>
        </div>
        <nav className="mt-8">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'orders', label: '📦 Orders', icon: '📦' },
            { id: 'foods', label: '🍕 My Menu', icon: '🍕' },
            { id: 'completed', label: '✅ Completed', icon: '✅' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-6 py-3 transition flex items-center gap-3 ${
                activeTab === item.id ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-3 transition hover:bg-red-600 flex items-center gap-3 mt-8"
          >
            <span className="text-xl">🚪</span> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'dashboard' && stats && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Orders', value: stats.total_orders, color: 'bg-blue-500', icon: '📦' },
                { title: 'Pending Orders', value: stats.pending_orders, color: 'bg-yellow-500', icon: '⏳' },
                { title: 'Completed Orders', value: stats.orders_completed, color: 'bg-green-500', icon: '✅' },
                { title: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, color: 'bg-purple-500', icon: '💰' },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${card.color} rounded-2xl p-6 text-white shadow-lg`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90">{card.title}</p>
                      <p className="text-3xl font-bold mt-2">{card.value}</p>
                    </div>
                    <span className="text-4xl">{card.icon}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Active Orders</h1>
            <div className="space-y-4">
              {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className={`${getStatusColor(order.status)} text-white px-6 py-3 flex justify-between items-center`}>
                    <div>
                      <span className="font-bold">Order #{order.id.slice(-8)}</span>
                      <span className="ml-3 text-sm opacity-90">{order.order_date}</span>
                    </div>
                    <span className="text-sm font-semibold">{getStatusText(order.status)}</span>
                  </div>
                  <div className="p-6">
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Customer Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>👤 Name: {order.user_name}</div>
                        <div>📧 Email: {order.user_email}</div>
                        <div>📞 Phone: {order.user_phone}</div>
                        <div>📍 Address: {order.delivery_address?.street}, {order.delivery_address?.city}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Order Items</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 border-b">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-bold">Total Amount:</span>
                      <span className="text-xl font-bold text-orange-500">₹{order.total_amount}</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      {getNextStatuses(order.status).map((next) => (
                        <button
                          key={next.status}
                          onClick={() => updateOrderStatus(order.id, next.status)}
                          className={`${next.color} text-white px-4 py-2 rounded-lg hover:opacity-90 transition`}
                        >
                          {next.label}
                        </button>
                      ))}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <p className="text-gray-500">No active orders</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'foods' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">My Menu</h1>
              <button
                onClick={() => setShowAddFood(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                + Add New Food Item
              </button>
            </div>

            {/* Add Food Modal */}
            {showAddFood && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Add New Food Item</h2>
                  <form onSubmit={handleAddFood}>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Food Name</label>
                      <input
                        type="text"
                        value={newFood.name}
                        onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={newFood.price}
                        onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Category</label>
                      <select
                        value={newFood.category}
                        onChange={(e) => setNewFood({...newFood, category: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option>Breakfast</option>
                        <option>Lunch</option>
                        <option>Dinner</option>
                        <option>Snacks</option>
                        <option>Dessert</option>
                        <option>Beverages</option>
                        <option>Fast Food</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newFood.description}
                        onChange={(e) => setNewFood({...newFood, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="2"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={newFood.image}
                        onChange={(e) => setNewFood({...newFood, image: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        Add Food
                      </button>
                      <button type="button" onClick={() => setShowAddFood(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Food Modal */}
            {editingFood && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                  <h2 className="text-2xl font-bold mb-4">Edit Food Item</h2>
                  <form onSubmit={handleUpdateFood}>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Food Name</label>
                      <input
                        type="text"
                        value={editingFood.name}
                        onChange={(e) => setEditingFood({...editingFood, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={editingFood.price}
                        onChange={(e) => setEditingFood({...editingFood, price: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Category</label>
                      <select
                        value={editingFood.category}
                        onChange={(e) => setEditingFood({...editingFood, category: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option>Breakfast</option>
                        <option>Lunch</option>
                        <option>Dinner</option>
                        <option>Snacks</option>
                        <option>Dessert</option>
                        <option>Beverages</option>
                        <option>Fast Food</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editingFood.description}
                        onChange={(e) => setEditingFood({...editingFood, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="2"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Update Food
                      </button>
                      <button type="button" onClick={() => setEditingFood(null)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Food List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.map((food) => (
                <div key={food.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img src={food.image} alt={food.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{food.name}</h3>
                        <p className="text-gray-500 text-sm">{food.category}</p>
                      </div>
                      <span className="text-orange-500 font-bold text-xl">₹{food.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{food.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm ml-1">{food.rating}</span>
                      <span className={`ml-3 text-xs px-2 py-1 rounded-full ${food.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {food.is_available ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => toggleAvailability(food.id, food.is_available)}
                        className={`flex-1 px-3 py-1 rounded-lg text-white text-sm ${food.is_available ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                      >
                        {food.is_available ? 'Mark Sold Out' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => setEditingFood(food)}
                        className="flex-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFood(food.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {foods.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <p className="text-gray-500">No food items yet. Click "Add New Food Item" to get started.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Completed Orders</h1>
            <div className="space-y-4">
              {orders.filter(o => o.status === 'delivered').map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-green-500 text-white px-6 py-3">
                    <span className="font-bold">Order #{order.id.slice(-8)}</span>
                    <span className="ml-3 text-sm opacity-90">{order.order_date}</span>
                  </div>
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="font-semibold">Customer:</span> {order.user_name}
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold">Phone:</span> {order.user_phone}
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold">Address:</span> {order.delivery_address?.street}, {order.delivery_address?.city}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-bold">Total:</span>
                      <span className="text-xl font-bold text-orange-500">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.status === 'delivered').length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <p className="text-gray-500">No completed orders yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantDashboard