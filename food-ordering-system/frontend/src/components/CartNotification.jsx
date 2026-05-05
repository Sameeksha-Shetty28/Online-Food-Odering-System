import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

const CartNotification = () => {
  const [showNotification, setShowNotification] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState(null)
  const { cartItems, total } = useCart()

  const formatPrice = (price) => {
    return `₹${price}`
  }

  useEffect(() => {
    const handleCartUpdate = (event) => {
      if (event.detail) {
        setLastAddedItem(event.detail)
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 3000)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // Don't show cart button if cart is empty
  if (cartItems.length === 0) return null

  return (
    <>
      {/* Floating Cart Button - Only one instance */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
      >
        <button
          onClick={() => window.location.href = '/cart'}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group"
        >
          <span className="text-2xl">🛒</span>
          <div className="text-left">
            <div className="font-bold">View Cart</div>
            <div className="text-sm opacity-90">{formatPrice(total)}</div>
          </div>
          {cartItems.length > 0 && (
            <span className="bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </motion.div>

      {/* Notification Popup */}
      <AnimatePresence>
        {showNotification && lastAddedItem && (
          <motion.div
            initial={{ opacity: 0, x: -100, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -100, y: 50 }}
            className="fixed bottom-24 left-6 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
          >
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-semibold">Added to Cart!</div>
              <div className="text-sm">{lastAddedItem.name} - {formatPrice(lastAddedItem.price)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default CartNotification