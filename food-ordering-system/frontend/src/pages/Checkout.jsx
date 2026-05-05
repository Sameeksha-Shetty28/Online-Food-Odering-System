import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { motion } from 'framer-motion'

const Checkout = () => {
  const { cartItems, total, fetchCart, savedAddresses, fetchAddresses } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: ''
  })

  const formatPrice = (price) => {
    return `₹${Number(price).toFixed(2)}`
  }

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart')
    }
    fetchAddresses()
  }, [])

  const handleAddressSelect = (addressId) => {
    const addr = savedAddresses.find(a => a.id === addressId)
    setSelectedAddress(addr)
    setAddress({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!address.street || !address.city || !address.state || !address.pincode) {
      alert('Please fill in all address fields')
      return
    }

    setLoading(true)

    // Format items with required fields for backend
    const orderItems = cartItems.map(item => ({
      food_id: item.food_id,
      name: item.name,
      restaurant_id: item.restaurant_id || "temp",
      restaurant_name: item.restaurant_name || "Restaurant",
      price: item.price,
      quantity: item.quantity
    }))

    const orderData = {
      items: orderItems,
      total_price: total,
      delivery_address: address
    }

    try {
      console.log('Sending order:', orderData)
      const response = await orderAPI.createOrder(orderData)
      console.log('Order response:', response.data)
      await fetchCart()
      alert('Order placed successfully! 🎉')
      navigate('/orders')
    } catch (error) {
      console.error('Error placing order:', error)
      console.error('Error response:', error.response?.data)
      alert(`Failed to place order: ${error.response?.data?.detail || 'Please try again'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!cartItems || cartItems.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button onClick={() => navigate(-1)} className="mb-4 text-gray-600 hover:text-orange-500 flex items-center gap-1">
        ← Back to Cart
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
          
          {savedAddresses && savedAddresses.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={useSavedAddress}
                  onChange={(e) => setUseSavedAddress(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Use saved address</span>
              </label>
              
              {useSavedAddress && (
                <select
                  onChange={(e) => handleAddressSelect(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mb-4"
                  defaultValue=""
                >
                  <option value="" disabled>Select saved address</option>
                  {savedAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label}: {addr.street}, {addr.city} - {addr.pincode}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                placeholder="Enter your street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  placeholder="State"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Pincode</label>
              <input
                type="text"
                value={address.pincode}
                onChange={(e) => setAddress({...address, pincode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                placeholder="6-digit pincode"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 font-semibold"
            >
              {loading ? 'Placing Order...' : `Place Order - ${formatPrice(total)}`}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-24"
        >
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.food_id} className="flex justify-between text-gray-600">
                <span>{item.name} x{item.quantity}</span>
                <span className="text-orange-600 font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total:</span>
              <span className="text-orange-500 font-bold text-2xl">{formatPrice(total)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Checkout