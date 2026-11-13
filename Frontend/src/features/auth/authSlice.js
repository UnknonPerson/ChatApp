
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as authAPI from './authAPI'

export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      return await authAPI.registerUser(data)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authAPI.loginUser(credentials)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      )
    }
  }
)

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.getProfile()
    } catch (error) {
      return rejectWithValue('Session expired')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.logoutUser()
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      )
    }
  }
)

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.isInitialized = true
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false
        state.isInitialized = true
        state.user = null
        state.isAuthenticated = false
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
  },
})

export const { clearAuthError } = authSlice.actions

export default authSlice.reducer
