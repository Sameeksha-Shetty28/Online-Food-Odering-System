import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [foods, setFoods] = useState([])
  const [orders, setOrders] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [showAddRestaurant, setShowAddRestaurant] = useState(false)
  const [showAddFood, setShowAddFood] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [editingFood, setEditingFood] = useState(null)
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    cuisine: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
    opening_time: '10:00',
    closing_time: '22:00'
  })
  const [newFood, setNewFood] = useState({
    name: '',
    restaurant_id: '',
    restaurant_name: '',
    price: '',
    category: 'Lunch',
    description: '',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300',
    rating: 4.0,
    meal_type: 'lunch',
    mood_tags: ['happy'],
    price_range: 'medium',
    is_available: true
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    fetchDashboard()
    fetchUsers()
    fetchFoods()
    fetchOrders()
    fetchRestaurants()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/admin/login')
    }
  }

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/dashboard', getAuthHeaders())
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/users', getAuthHeaders())
      setUsers(response.data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/foods', getAuthHeaders())
      setFoods(response.data.foods)
    } catch (error) {
      console.error('Error fetching foods:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/orders', getAuthHeaders())
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/restaurants', getAuthHeaders())
      setRestaurants(response.data.restaurants)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  // User Management
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await axios.delete(`http://localhost:8000/api/admin/users/${userId}`, getAuthHeaders())
      fetchUsers()
    }
  }

  // Restaurant Management
  const handleAddRestaurant = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/api/admin/restaurants', newRestaurant, getAuthHeaders())
      alert('Restaurant added successfully!')
      setShowAddRestaurant(false)
      setNewRestaurant({
        name: '',
        email: '',
        password: '',
        phone: '',
        location: '',
        cuisine: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
        opening_time: '10:00',
        closing_time: '22:00'
      })
      fetchRestaurants()
    } catch (error) {
      console.error('Error adding restaurant:', error)
      alert('Failed to add restaurant')
    }
  }

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:8000/api/admin/restaurants/${editingRestaurant.id}`, editingRestaurant, getAuthHeaders())
      alert('Restaurant updated successfully!')
      setEditingRestaurant(null)
      fetchRestaurants()
    } catch (error) {
      console.error('Error updating restaurant:', error)
      alert('Failed to update restaurant')
    }
  }

  const handleDeleteRestaurant = async (restaurantId) => {
    if (window.confirm('Are you sure you want to delete this restaurant? This will also delete all its food items.')) {
      await axios.delete(`http://localhost:8000/api/admin/restaurants/${restaurantId}`, getAuthHeaders())
      fetchRestaurants()
      fetchFoods()
    }
  }

  // Food Management
  const handleAddFood = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/api/admin/foods', newFood, getAuthHeaders())
      alert('Food added successfully!')
      setShowAddFood(false)
      setNewFood({
        name: '',
        restaurant_id: '',
        restaurant_name: '',
        price: '',
        category: 'Lunch',
        description: '',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300',
        rating: 4.0,
        meal_type: 'lunch',
        mood_tags: ['happy'],
        price_range: 'medium',
        is_available: true
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
      await axios.put(`http://localhost:8000/api/admin/foods/${editingFood.id}`, editingFood, getAuthHeaders())
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
      await axios.delete(`http://localhost:8000/api/admin/foods/${foodId}`, getAuthHeaders())
      fetchFoods()
    }
  }

  // Order Management
  const handleUpdateOrderStatus = async (orderId, status) => {
    await axios.put(`http://localhost:8000/api/admin/orders/${orderId}/status?status=${status}`, {}, getAuthHeaders())
    fetchOrders()
    fetchDashboard()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }

  const barChartData = stats ? {
    labels: Object.keys(stats.monthly_sales || {}),
    datasets: [{
      label: 'Monthly Sales (₹)',
      data: Object.values(stats.monthly_sales || {}),
      backgroundColor: 'rgba(249, 115, 22, 0.8)',
      borderRadius: 10,
    }]
  } : null

  const pieChartData = stats ? {
    labels: Object.keys(stats.category_sales || {}),
    datasets: [{
      data: Object.values(stats.category_sales || {}),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'],
    }]
  } : null

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-orange-400">Admin Panel</h2>
          <p className="text-sm text-gray-400 mt-1">Food Ordering System</p>
        </div>
        <nav className="mt-8">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'restaurants', label: '🏪 Restaurants', icon: '🏪' },
            { id: 'foods', label: '🍕 Foods', icon: '🍕' },
            { id: 'orders', label: '📦 Orders', icon: '📦' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-6 py-3 transition flex items-center gap-3 ${
                activeTab === item.id ? 'bg-orange-600' : 'hover:bg-gray-700'
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
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Users', value: stats.total_users, color: 'bg-blue-500', icon: '👥' },
                { title: 'Total Restaurants', value: stats.total_restaurants, color: 'bg-purple-500', icon: '🏪' },
                { title: 'Total Foods', value: stats.total_foods, color: 'bg-green-500', icon: '🍕' },
                { title: 'Total Orders', value: stats.total_orders, color: 'bg-yellow-500', icon: '📦' },
                { title: 'Total Revenue', value: `₹${stats.total_revenue?.toLocaleString() || 0}`, color: 'bg-orange-500', icon: '💰' },
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Monthly Sales Trend</h3>
                {barChartData && <Bar data={barChartData} options={{ responsive: true }} />}
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
                {pieChartData && <Pie data={pieChartData} options={{ responsive: true }} />}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Order ID</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders?.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-2">#{order.id?.slice(-8)}</td>
                        <td className="px-4 py-2">{order.user_name}</td>
                        <td className="px-4 py-2">₹{order.total_price}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">User Management</h1>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role !== 'admin').map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="px-6 py-3">{user.name}</td>
                      <td className="px-6 py-3">{user.email}</td>
                      <td className="px-6 py-3">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-3">{user.role || 'user'}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Restaurant Management</h1>
              <button
                onClick={() => setShowAddRestaurant(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                + Add Restaurant
              </button>
            </div>

            {/* Add Restaurant Modal */}
            {showAddRestaurant && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Add New Restaurant</h2>
                  <form onSubmit={handleAddRestaurant}>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Restaurant Name</label>
                      <input
                        type="text"
                        value={newRestaurant.name}
                        onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newRestaurant.email}
                        onChange={(e) => setNewRestaurant({...newRestaurant, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={newRestaurant.password}
                        onChange={(e) => setNewRestaurant({...newRestaurant, password: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={newRestaurant.phone}
                        onChange={(e) => setNewRestaurant({...newRestaurant, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newRestaurant.location}
                        onChange={(e) => setNewRestaurant({...newRestaurant, location: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Cuisine</label>
                      <input
                        type="text"
                        value={newRestaurant.cuisine}
                        onChange={(e) => setNewRestaurant({...newRestaurant, cuisine: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newRestaurant.description}
                        onChange={(e) => setNewRestaurant({...newRestaurant, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="2"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        Add Restaurant
                      </button>
                      <button type="button" onClick={() => setShowAddRestaurant(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Restaurant Modal */}
            {editingRestaurant && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                  <h2 className="text-2xl font-bold mb-4">Edit Restaurant</h2>
                  <form onSubmit={handleUpdateRestaurant}>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Restaurant Name</label>
                      <input
                        type="text"
                        value={editingRestaurant.name}
                        onChange={(e) => setEditingRestaurant({...editingRestaurant, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingRestaurant.email}
                        onChange={(e) => setEditingRestaurant({...editingRestaurant, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editingRestaurant.phone}
                        onChange={(e) => setEditingRestaurant({...editingRestaurant, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editingRestaurant.location}
                        onChange={(e) => setEditingRestaurant({...editingRestaurant, location: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Update Restaurant
                      </button>
                      <button type="button" onClick={() => setEditingRestaurant(null)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Restaurant List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img src={restaurant.image} alt={restaurant.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-xl">{restaurant.name}</h3>
                    <p className="text-gray-500 text-sm">{restaurant.cuisine} • {restaurant.location}</p>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{restaurant.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm ml-1">{restaurant.rating || 4.5}</span>
                      <span className={`ml-3 text-xs px-2 py-1 rounded-full ${restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {restaurant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setEditingRestaurant(restaurant)}
                        className="flex-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                        className="flex-1 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {restaurants.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <p className="text-gray-500">No restaurants found. Click "Add Restaurant" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Food Management</h1>
              <button
                onClick={() => setShowAddFood(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                + Add Food Item
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
                      <label className="block text-gray-700 mb-1">Restaurant</label>
                      <select
                        value={newFood.restaurant_id}
                        onChange={(e) => {
                          const selected = restaurants.find(r => r.id === e.target.value)
                          setNewFood({
                            ...newFood,
                            restaurant_id: e.target.value,
                            restaurant_name: selected?.name || ''
                          })
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select Restaurant</option>
                        {restaurants.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
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
                        <option>Chinese</option>
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
                        <option>Chinese</option>
                      </select>
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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Image</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Restaurant</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food.id} className="border-t">
                      <td className="px-6 py-3">
                        <img src={food.image} alt={food.name} className="w-12 h-12 object-cover rounded" />
                      </td>
                      <td className="px-6 py-3 font-semibold">{food.name}</td>
                      <td className="px-6 py-3">{food.restaurant_name}</td>
                      <td className="px-6 py-3 text-orange-500 font-bold">₹{food.price}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{food.category}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${food.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {food.is_available ? 'Available' : 'Sold Out'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => setEditingFood(food)}
                          className="text-blue-500 hover:text-blue-700 mr-3"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFood(food.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {foods.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl mt-4">
                <p className="text-gray-500">No food items found. Click "Add Food Item" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Management</h1>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Order ID</th>
                    <th className="px-6 py-3 text-left">Customer</th>
                    <th className="px-6 py-3 text-left">Items</th>
                    <th className="px-6 py-3 text-left">Total</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="px-6 py-3">#{order.id?.slice(-8)}</td>
                      <td className="px-6 py-3">{order.user_name}</td>
                      <td className="px-6 py-3">{order.items_count || 0} items</td>
                      <td className="px-6 py-3 text-orange-500 font-bold">₹{order.total_price}</td>
                      <td className="px-6 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-sm border ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="confirmed">✅ Confirmed</option>
                          <option value="preparing">🍳 Preparing</option>
                          <option value="out_for_delivery">🚚 Out for Delivery</option>
                          <option value="delivered">🎉 Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-3">
                        <button className="text-blue-500 hover:text-blue-700">📋 View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl mt-4">
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard