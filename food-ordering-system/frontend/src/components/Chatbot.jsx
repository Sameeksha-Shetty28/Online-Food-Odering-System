import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [showMoodOptions, setShowMoodOptions] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedHealth, setSelectedHealth] = useState('all')
  const [filteredRecs, setFilteredRecs] = useState([])
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const moods = [
    { emoji: "😢", name: "Sad", value: "sad", color: "bg-blue-500", description: "Sweet Desserts", icon: "🍰" },
    { emoji: "🌶️", name: "Chatpata", value: "chatpata", color: "bg-red-500", description: "Spicy Snacks", icon: "🌶️" },
    { emoji: "🥤", name: "Thirsty", value: "tired", color: "bg-cyan-500", description: "Refreshing Drinks", icon: "🥤" },
    { emoji: "🎉", name: "Happy", value: "happy", color: "bg-yellow-500", description: "Celebration Food", icon: "🎉" },
    { emoji: "⚡", name: "Energetic", value: "energetic", color: "bg-orange-500", description: "Power Meals", icon: "⚡" },
    { emoji: "😊", name: "Normal", value: "normal", color: "bg-gray-500", description: "Regular Meals", icon: "🍽️" }
  ]

  const categories = ['all', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Dessert', 'Fast Food']
  const healthOptions = ['all', 'healthy', 'high-protein', 'vegan']

  const getTimeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning! ☀️"
    if (hour < 17) return "Good afternoon! 🌤️"
    return "Good evening! 🌙"
  }

  const getMealTime = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) return "breakfast"
    if (hour >= 11 && hour < 16) return "lunch"
    if (hour >= 16 && hour < 19) return "snacks"
    return "dinner"
  }

  const handleAddToCart = async (food) => {
    if (!user) {
      navigate('/login')
      return
    }
    await addToCart(food.id)
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { name: food.name, price: food.price, id: food.id }
    }))
    alert(`${food.name} added to cart! 🛒`)
  }

  const handleMoodSelect = async (mood) => {
    const token = localStorage.getItem('token')
    if (!token || !user) {
      alert('Please login first to use the AI Food Assistant!')
      navigate('/login')
      return
    }

    setLoading(true)
    setShowMoodOptions(false)

    setMessages(prev => [...prev, {
      type: 'user',
      text: `I'm feeling ${mood.name} ${mood.emoji} - ${mood.description}`
    }])

    try {
      const mealTime = getMealTime()
      
      const response = await axios.post(
        'http://localhost:8000/api/chat/mood-recommend',
        { mood: mood.value, time_of_day: mealTime },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      )

      if (response.data && response.data.message) {
        setMessages(prev => [...prev, { type: 'bot', text: response.data.message }])
      }

      if (response.data && response.data.recommendations && response.data.recommendations.length > 0) {
        setRecommendations(response.data.recommendations)
        setFilteredRecs(response.data.recommendations)
        setIsExpanded(true)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, please try again! 🙏" }])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...recommendations]
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    
    if (selectedHealth !== 'all') {
      if (selectedHealth === 'healthy') {
        filtered = filtered.filter(item => ['Beverages', 'Breakfast', 'Salads'].includes(item.category))
      } else if (selectedHealth === 'high-protein') {
        filtered = filtered.filter(item => ['Lunch', 'Dinner'].includes(item.category))
      } else if (selectedHealth === 'vegan') {
        filtered = filtered.filter(item => ['Breakfast', 'Snacks', 'Beverages'].includes(item.category))
      }
    }
    
    setFilteredRecs(filtered)
  }

  React.useEffect(() => {
    applyFilters()
  }, [selectedCategory, selectedHealth, recommendations])

  const resetChat = () => {
    setMessages([])
    setRecommendations([])
    setFilteredRecs([])
    setShowMoodOptions(true)
    setIsExpanded(false)
    setSelectedCategory('all')
    setSelectedHealth('all')
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 hover:scale-110 group"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200"
            style={{ width: isExpanded ? '900px' : '420px', height: isExpanded ? '650px' : '550px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">AI Mood Food Assistant 🍽️</h3>
                  <p className="text-sm opacity-90">{getTimeMessage()} - {getMealTime()} time!</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={toggleExpand} className="text-white hover:text-gray-200 transition">
                    {isExpanded ? '📐' : '🗖'}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition">
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col" style={{ height: 'calc(100% - 70px)' }}>
              {/* Mood Options Section */}
              {showMoodOptions && messages.length === 0 && user && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-2 animate-bounce">🤖</div>
                    <p className="text-gray-700 font-semibold text-lg">Hi {user.name}! How are you feeling today?</p>
                    <p className="text-sm text-gray-500">Select your mood for personalized recommendations</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => handleMoodSelect(mood)}
                        className={`${mood.color} text-white p-4 rounded-xl hover:scale-105 transition shadow-md text-center`}
                      >
                        <div className="text-3xl mb-1">{mood.emoji}</div>
                        <div className="font-bold">{mood.name}</div>
                        <div className="text-xs opacity-90 mt-1">{mood.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Section */}
              {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: '200px' }}>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`mb-3 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-orange-500 text-white' : 'bg-white shadow border'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start mb-3">
                      <div className="bg-white p-3 rounded-lg shadow">Thinking... 🤔</div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations Section */}
              {recommendations.length > 0 && (
                <div className="flex-1 overflow-y-auto p-4 bg-white border-t" style={{ maxHeight: '350px' }}>
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2 sticky top-0 bg-white py-2">
                    <p className="font-semibold text-gray-700">✨ Recommended for you:</p>
                    <button onClick={resetChat} className="text-xs bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300">
                      New Chat
                    </button>
                  </div>
                  
                  {/* Filters */}
                  <div className="mb-4 flex flex-wrap gap-2 sticky top-10 bg-white py-2">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)} 
                      className="text-xs border rounded px-2 py-1 bg-white"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                    </select>
                    <select 
                      value={selectedHealth} 
                      onChange={(e) => setSelectedHealth(e.target.value)} 
                      className="text-xs border rounded px-2 py-1 bg-white"
                    >
                      {healthOptions.map(opt => <option key={opt} value={opt}>{opt === 'all' ? 'All Health' : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                    </select>
                  </div>
                  
                  {/* Recommendations Grid */}
                  <div className={`grid ${isExpanded ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-3`}>
                    {filteredRecs.map((food) => (
                      <div key={food.id} className="bg-gray-50 rounded-xl p-3 shadow hover:shadow-md transition border">
                        <div className="flex gap-3">
                          <img 
                            src={food.image} 
                            alt={food.name} 
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300'}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{food.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{food.restaurant || 'Popular Restaurant'}</p>
                            <p className="text-orange-500 font-bold text-sm">₹{food.price}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{food.why_recommended}</p>
                            <button 
                              onClick={() => handleAddToCart(food)} 
                              className="mt-2 bg-orange-500 text-white px-2 py-1 rounded text-xs w-full hover:bg-orange-600 transition"
                            >
                              Add to Cart 🛒
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredRecs.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No items match your filters</p>
                  )}
                </div>
              )}

              {/* Login Prompt */}
              {!user && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔐</div>
                    <p className="text-gray-700 font-semibold mb-2">Please login first!</p>
                    <button 
                      onClick={() => navigate('/login')} 
                      className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                      Login Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t">
              <p className="text-xs text-gray-500 text-center">
                🤖 AI suggests food based on your mood & time ({getMealTime()})
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Chatbot