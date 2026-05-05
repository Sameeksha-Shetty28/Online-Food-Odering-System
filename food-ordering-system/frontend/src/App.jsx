import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import CartNotification from './components/CartNotification'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import FoodListing from './pages/FoodListing'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import RestaurantLogin from './pages/Restaurant/RestaurantLogin'
import RestaurantDashboard from './pages/Restaurant/RestaurantDashboard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/foods" element={<FoodListing />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* Restaurant Routes */}
              <Route path="/restaurant/login" element={<RestaurantLogin />} />
              <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
            </Routes>
            {/* CartNotification appears only once here */}
            <CartNotification />
            <Chatbot />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App