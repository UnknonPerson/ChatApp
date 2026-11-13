
import api from '../../services/api'

export const registerUser = async (data) => {
  const { data: response } = await api.post('/auth/register', data)
  return response
}

export const loginUser = async (credentials) => {
  const { data: response } = await api.post('/auth/login', credentials)
  return response.user
}

export const getProfile = async () => {
  const { data: response } = await api.get('/auth/profile')
  return response.user
}

export const refreshAccessToken = async () => {
  const { data: response } = await api.post('/auth/refresh')
  return response
}

export const logoutUser = async () => {
  const { data: response } = await api.post('/auth/logout')
  return response
}
