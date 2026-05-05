import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartSidebar from './CartSidebar'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [restaurantLoggedIn, setRestaurantLoggedIn] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [restaurantName, setRestaurantName] = useState('')

  // Check which portal is active
  useEffect(() => {
    // Check for admin token
    const adminToken = localStorage.getItem('token')
    const adminData = localStorage.getItem('user')
    if (adminToken && adminData && !location.pathname.includes('/restaurant')) {
      try {
        const parsedAdmin = JSON.parse(adminData)
        setAdminLoggedIn(true)
        setAdminName(parsedAdmin.name || 'Admin')
      } catch (e) {
        setAdminLoggedIn(false)
      }
    } else {
      setAdminLoggedIn(false)
    }

    // Check for restaurant token
    const restaurantToken = localStorage.getItem('restaurant_token')
    const restaurantData = localStorage.getItem('restaurant')
    if (restaurantToken && restaurantData) {
      try {
        const parsedRestaurant = JSON.parse(restaurantData)
        setRestaurantLoggedIn(true)
        setRestaurantName(parsedRestaurant.name || 'Restaurant')
      } catch (e) {
        setRestaurantLoggedIn(false)
      }
    } else {
      setRestaurantLoggedIn(false)
    }
  }, [location.pathname])

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  // Handle admin logout
  const handleAdminLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAdminLoggedIn(false)
    navigate('/admin/login')
  }

  // Handle restaurant logout
  const handleRestaurantLogout = () => {
    localStorage.removeItem('restaurant_token')
    localStorage.removeItem('restaurant')
    setRestaurantLoggedIn(false)
    navigate('/restaurant/login')
  }

  // Handle user logout
  const handleUserLogout = () => {
    logout()
    navigate('/login')
  }

  // Don't show navbar on admin or restaurant pages
  if (location.pathname.includes('/admin') || location.pathname.includes('/restaurant')) {
    // Show a simple navbar for admin/restaurant portals
    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-orange-500">
              FoodieHub
            </Link>
            <div className="flex items-center space-x-4">
              {adminLoggedIn && (
                <>
                  <span className="text-gray-700">👑 Admin: {adminName}</span>
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 text-sm"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                  >
                    Logout
                  </button>
                </>
              )}
              {restaurantLoggedIn && (
                <>
                  <span className="text-gray-700">🏪 {restaurantName}</span>
                  <button
                    onClick={() => navigate('/restaurant/dashboard')}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 text-sm"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleRestaurantLogout}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                  >
                    Logout
                  </button>
                </>
              )}
              {!adminLoggedIn && !restaurantLoggedIn && (
                <Link to="/" className="text-gray-600 hover:text-orange-500">
                  Back to Site
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Regular user navbar
  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-orange-500">
              FoodieHub
            </Link>

            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-orange-500 transition">
                Home
              </Link>
              <Link to="/foods" className="text-gray-700 hover:text-orange-500 transition">
                Menu
              </Link>
              
              {user && (
                <>
                  <Link to="/orders" className="text-gray-700 hover:text-orange-500 transition">
                    Orders
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-orange-500 transition">
                    👤 Profile
                  </Link>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-gray-700 hover:text-orange-500 transition"
                  >
                    🛒
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Hi, {user.name}</span>
                  <button
                    onClick={handleUserLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Link
                    to="/login"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar