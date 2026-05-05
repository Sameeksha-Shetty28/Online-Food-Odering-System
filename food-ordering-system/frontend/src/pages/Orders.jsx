import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { motion } from 'framer-motion'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders()
      console.log('Orders:', response.data)
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'delivered': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const formatPrice = (price) => {
    return `₹${Number(price).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Navigation Buttons */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => navigate('/')} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2">
          ← Back to Home
        </button>
        <button onClick={() => navigate('/foods')} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
          ← Continue Shopping
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders yet</p>
          <button 
            onClick={() => navigate('/foods')} 
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id ? order.id.slice(-8) : 'Unknown'}</p>
                  <p className="text-sm text-gray-500">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Unknown date'} at{' '}
                    {order.created_at ? new Date(order.created_at).toLocaleTimeString('en-IN') : 'Unknown time'}
                  </p>
                </div>
                <div className={`font-semibold ${getStatusColor(order.status)}`}>
                  {order.status ? order.status.toUpperCase() : 'PENDING'}
                </div>
              </div>
              
              <div className="space-y-2">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-semibold text-orange-600">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="text-orange-500 font-bold text-2xl">{formatPrice(order.total_price)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders