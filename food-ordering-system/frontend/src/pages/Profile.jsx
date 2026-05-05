import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const { user, updateProfile, logout } = useAuth()
  const { savedAddresses, saveAddress, updateAddress, deleteAddress } = useCart()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home'
  })
  const [message, setMessage] = useState('')

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    const result = await updateProfile(formData)
    if (result.success) {
      setMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(result.error)
    }
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    const result = await saveAddress(addressForm)
    if (result.success) {
      setMessage('Address saved successfully!')
      setAddressForm({ street: '', city: '', state: '', pincode: '', label: 'Home' })
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(result.error)
    }
  }

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    const result = await updateAddress(editingAddress._id, addressForm)
    if (result.success) {
      setMessage('Address updated successfully!')
      setEditingAddress(null)
      setAddressForm({ street: '', city: '', state: '', pincode: '', label: 'Home' })
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(result.error)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const result = await deleteAddress(addressId)
      if (result.success) {
        setMessage('Address deleted successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const startEditAddress = (address) => {
    setEditingAddress(address)
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      label: address.label
    })
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="mb-4 text-gray-600 hover:text-orange-500 flex items-center gap-1">
        ← Back to Home
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Personal Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-orange-500 hover:text-orange-600"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || 'Not added'}</p>
          </div>
        )}
      </div>

      {/* Saved Addresses */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Saved Addresses</h2>
        
        {savedAddresses.length === 0 ? (
          <p className="text-gray-500">No saved addresses yet.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {savedAddresses.map((addr) => (
              <div key={addr._id} className="border rounded-lg p-3 flex justify-between items-start">
                <div>
                  <p className="font-semibold">{addr.label}</p>
                  <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditAddress(addr)} className="text-blue-500 hover:text-blue-600 text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 hover:text-red-600 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 className="font-semibold mb-3">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
        <form onSubmit={editingAddress ? handleUpdateAddress : handleSaveAddress}>
          <div className="mb-3">
            <label className="block text-gray-700 text-sm mb-1">Label (Home/Work/Other)</label>
            <input
              type="text"
              value={addressForm.label}
              onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 text-sm mb-1">Street Address</label>
            <input
              type="text"
              value={addressForm.street}
              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-gray-700 text-sm mb-1">City</label>
              <input
                type="text"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div className="flex gap-3 mb-6">
  <button onClick={() => navigate('/')} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2">
    ← Back to Home
  </button>
  <button onClick={() => navigate('/foods')} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
    ← Browse Menu
  </button>
</div>
            <div>
              <label className="block text-gray-700 text-sm mb-1">State</label>
              <input
                type="text"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 text-sm mb-1">Pincode</label>
            <input
              type="text"
              value={addressForm.pincode}
              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
              {editingAddress ? 'Update Address' : 'Save Address'}
            </button>
            {editingAddress && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null)
                  setAddressForm({ street: '', city: '', state: '', pincode: '', label: 'Home' })
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  )
}

export default Profile