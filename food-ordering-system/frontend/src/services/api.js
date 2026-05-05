import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  updateProfile: (data, token) => API.put('/auth/profile', data, { headers: { Authorization: `Bearer ${token}` } }),
}

export const foodAPI = {
  getAll: () => API.get('/foods'),
  getOne: (id) => API.get(`/foods/${id}`),
}

export const cartAPI = {
  getCart: () => API.get('/cart'),
  addItem: (data) => API.post('/cart/add', data),
  removeItem: (foodId) => API.delete(`/cart/remove/${foodId}`),
  updateQuantity: (foodId, quantity) => API.put(`/cart/update/${foodId}?quantity=${quantity}`),
  getAddresses: () => API.get('/cart/addresses'),
  saveAddress: (data) => API.post('/cart/addresses', data),
  updateAddress: (id, data) => API.put(`/cart/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/cart/addresses/${id}`),
}

export const orderAPI = {
  createOrder: (data) => API.post('/orders', data),
  getOrders: () => API.get('/orders'),
}

export const recommendAPI = {
  getRecommendations: (budget = 'medium') => API.get(`/recommend?budget=${budget}`),
}

export default API