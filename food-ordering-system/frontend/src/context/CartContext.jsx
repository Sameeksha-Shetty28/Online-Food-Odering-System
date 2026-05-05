import React, { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const [savedAddresses, setSavedAddresses] = useState([])
  const { user } = useAuth()

  const fetchCart = async () => {
    if (!user) return
    try {
      const response = await cartAPI.getCart()
      console.log('Cart response:', response.data)
      setCartItems(response.data.items || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const fetchAddresses = async () => {
    if (!user) return
    try {
      const response = await cartAPI.getAddresses()
      setSavedAddresses(response.data.addresses || [])
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCart()
      fetchAddresses()
    } else {
      setCartItems([])
      setTotal(0)
      setSavedAddresses([])
    }
  }, [user])

  const addToCart = async (foodId, quantity = 1) => {
    try {
      const response = await cartAPI.addItem({ food_id: foodId, quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail }
    }
  }

  const removeFromCart = async (foodId) => {
    try {
      await cartAPI.removeItem(foodId)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail }
    }
  }

  const updateQuantity = async (foodId, quantity) => {
    try {
      await cartAPI.updateQuantity(foodId, quantity)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail }
    }
  }

  const saveAddress = async (address) => {
    try {
      const response = await cartAPI.saveAddress(address)
      await fetchAddresses()
      return { success: true, address: response.data.address }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail }
    }
  }

  const updateAddress = async (addressId, address) => {
    try {
      await cartAPI.updateAddress(addressId, address)
      await fetchAddresses()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail }
    }
  }

  const deleteAddress = async (addressId) => {
    try {
      await cartAPI.deleteAddress(addressId)
      await fetchAddresses()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail }
    }
  }

  return (
    <CartContext.Provider value={{ 
      cartItems, total, addToCart, removeFromCart, updateQuantity, fetchCart,
      savedAddresses, saveAddress, updateAddress, deleteAddress, fetchAddresses
    }}>
      {children}
    </CartContext.Provider>
  )
}