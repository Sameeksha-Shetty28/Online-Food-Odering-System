import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { foodAPI } from '../services/api'
import FoodCard from '../components/FoodCard'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const FoodListing = () => {
  const [foods, setFoods] = useState([])
  const [filteredFoods, setFilteredFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchFoods()
  }, [])

  useEffect(() => {
    filterFoods()
  }, [category, searchTerm, foods])

  const fetchFoods = async () => {
    try {
      const response = await foodAPI.getAll()
      console.log('Fetched foods:', response.data.length)
      setFoods(response.data)
      setFilteredFoods(response.data)
    } catch (error) {
      console.error('Error fetching foods:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterFoods = () => {
    let filtered = [...foods]
    if (category !== 'all') {
      filtered = filtered.filter(food => food.category === category)
    }
    if (searchTerm) {
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredFoods(filtered)
  }

  const categories = ['all', ...new Set(foods.map(f => f.category))]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Buttons */}
      <div className="flex gap-3 mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
        >
          ← Back to Home
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Our Menu</h1>
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Search for food..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setCategory(cat)} 
              className={`px-4 py-2 rounded-lg transition ${
                category === cat 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="card animate-pulse"><div className="h-48 bg-gray-300"></div><div className="p-4"><div className="h-4 bg-gray-300 rounded mb-2"></div></div></div>)}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500 text-lg">No foods found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FoodListing