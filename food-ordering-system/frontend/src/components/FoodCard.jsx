import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const FoodCard = ({ food }) => {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const formatPrice = (price) => {
    return `₹${price}`
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    await addToCart(food.id)
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { name: food.name, price: food.price, id: food.id }
    }))
    
    setTimeout(() => setAdding(false), 500)
  }

  // Get the first letter of restaurant name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'R'
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="relative overflow-hidden">
          <img 
            src={food.image} 
            alt={food.name} 
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            ⭐ {food.rating}
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-500 transition">
                {food.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <span className="text-xs">🏪</span> {food.restaurant_name || "Popular Restaurant"}
              </p>
            </div>
            <span className="text-orange-500 font-bold text-lg">{formatPrice(food.price)}</span>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
              {food.category}
            </span>
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            disabled={adding}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 font-semibold"
          >
            {adding ? 'Adding...' : 'Add to Cart 🛒'}
          </button>
        </div>
      </motion.div>

      {/* Food Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={food.image} alt={food.name} className="w-full h-64 object-cover" />
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{food.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">🏪 {food.restaurant_name || "Popular Restaurant"}</span>
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm">{food.rating}</span>
                  </div>
                </div>
                <span className="text-3xl font-bold text-orange-500">{formatPrice(food.price)}</span>
              </div>
              
              <div className="mb-4">
                <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">{food.category}</span>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm ml-2">Available</span>
              </div>
              
              <p className="text-gray-600 mb-4">
                {food.description || `Delicious ${food.name} prepared with authentic ingredients. A must-try dish from ${food.restaurant_name || "our restaurant"}.`}
              </p>
              
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2">Restaurant Info:</h4>
                <p className="text-gray-600 text-sm">{food.restaurant_name || "Popular Restaurant"} - Specializing in {food.category} cuisine</p>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:shadow-lg transition font-semibold text-lg"
              >
                {adding ? 'Adding...' : 'Add to Cart 🛒'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FoodCard