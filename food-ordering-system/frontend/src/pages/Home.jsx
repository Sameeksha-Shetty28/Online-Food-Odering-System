import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import RecommendationWidget from '../components/RecommendationWidget'
import { useAuth } from '../context/AuthContext'
import { foodAPI } from '../services/api'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [featuredItems, setFeaturedItems] = useState([])
  const controls = useAnimation()
  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  useEffect(() => {
    fetchFeaturedItems()
  }, [])

  const fetchFeaturedItems = async () => {
    try {
      const response = await foodAPI.getAll()
      setFeaturedItems(response.data.slice(0, 4))
    } catch (error) {
      console.error('Error fetching featured items:', error)
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const stats = [
    { number: "500+", label: "Food Items", icon: "🍕" },
    { number: "50+", label: "Restaurants", icon: "🏪" },
    { number: "10k+", label: "Happy Customers", icon: "😊" },
    { number: "30min", label: "Fast Delivery", icon: "🚀" }
  ]

  const features = [
    { icon: "🤖", title: "AI Smart Recommendations", description: "Personalized food suggestions based on your mood & preferences", color: "from-purple-500 to-pink-500" },
    { icon: "⚡", title: "Lightning Fast Delivery", description: "Get your food delivered within 30 minutes", color: "from-blue-500 to-cyan-500" },
    { icon: "💰", title: "Best Prices Guaranteed", description: "Competitive prices with daily offers", color: "from-green-500 to-emerald-500" },
    { icon: "🔒", title: "Secure Payments", description: "100% secure payment gateway", color: "from-orange-500 to-red-500" }
  ]

  return (
    <div>
      {/* Hero Section with Parallax Effect */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Floating Food Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['🍕', '🍔', '🍜', '🍛', '🍦', '☕'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              initial={{ y: -100, x: Math.random() * window.innerWidth }}
              animate={{ y: window.innerHeight + 100, x: Math.random() * window.innerWidth }}
              transition={{ duration: 15 + i * 2, repeat: Infinity, delay: i * 2 }}
              style={{ left: `${Math.random() * 100}%` }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative container mx-auto px-4 py-20 text-center text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-6">
              🎉 Welcome to FoodieHub
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Delicious Food Delivered
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-300">
                To Your Doorstep
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Experience the magic of AI-powered food recommendations tailored to your mood and taste
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/foods')}
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                🍽️ Order Now
              </motion.button>
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/orders')}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  📋 My Orders
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-orange-600">{stat.number}</div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendation Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm mb-4">
              🤖 AI Powered
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Smart Recommendations Just For You
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes your mood, time of day, and preferences to suggest the perfect meal
            </p>
          </motion.div>
          <RecommendationWidget />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50" ref={ref}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose FoodieHub?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the best food delivery experience with cutting-edge technology
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all text-center group"
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Satisfy Your Cravings?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of happy customers who order from FoodieHub every day
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/foods')}
              className="bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              Start Ordering Now 🍕
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home