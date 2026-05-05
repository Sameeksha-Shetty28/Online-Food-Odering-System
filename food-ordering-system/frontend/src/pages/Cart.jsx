import React from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Cart = () => {
  const { cartItems, total, removeFromCart, updateQuantity } = useCart()
  const navigate = useNavigate()

  const formatPrice = (price) => {
    return `₹${Number(price).toFixed(2)}`
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex gap-3 mb-6 justify-center">
          <button onClick={() => navigate('/')} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
            ← Back to Home
          </button>
          <button onClick={() => navigate('/foods')} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
            Browse Menu →
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navigation Buttons */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => navigate('/')} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2">
          ← Back to Home
        </button>
        <button onClick={() => navigate('/foods')} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
          ← Continue Shopping
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartItems.map((item, index) => (
            <motion.div
              key={item.food_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 border-b pb-4 mb-4"
            >
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-orange-500 font-bold text-xl">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQuantity(item.food_id, item.quantity - 1)} className="bg-gray-200 w-8 h-8 rounded hover:bg-gray-300">-</button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.food_id, item.quantity + 1)} className="bg-gray-200 w-8 h-8 rounded hover:bg-gray-300">+</button>
                  <button onClick={() => removeFromCart(item.food_id)} className="text-red-500 ml-auto hover:text-red-700">Remove</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-center">Order Summary</h2>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.food_id} className="flex justify-between text-gray-600 text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="text-orange-600">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total:</span>
                <span className="text-orange-500 font-bold text-2xl">{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:shadow-lg transition text-lg font-semibold">
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart