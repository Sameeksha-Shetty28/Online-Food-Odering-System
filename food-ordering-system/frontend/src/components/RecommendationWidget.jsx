import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { recommendAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import FoodCard from './FoodCard'

const RecommendationWidget = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState('medium')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchRecommendations()
    }
  }, [user, budget])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await recommendAPI.getRecommendations(budget)
      setRecommendations(response.data.recommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">🤖</span> AI Smart Recommendations
          </h2>
          <p className="text-gray-600 mt-1">Personalized based on weather, mood, and your taste</p>
        </div>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="cheap">💰 Budget Friendly</option>
          <option value="medium">💼 Medium Range</option>
          <option value="expensive">✨ Premium</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
              <div className="h-48 bg-gray-300 rounded-t-xl"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendations.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 text-lg">No recommendations available</p>
          <button onClick={fetchRecommendations} className="mt-4 text-orange-500 hover:text-orange-600">
            Refresh Recommendations
          </button>
        </div>
      )}
    </div>
  )
}

export default RecommendationWidget