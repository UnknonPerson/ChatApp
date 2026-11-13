
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getConversations } from './conversationAPI'

export const fetchConversations = createAsyncThunk(
  'conversations/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getConversations()
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to load conversations'
      )
    }
  }
)

const conversationSlice = createSlice({
  name: 'conversations',

  initialState: {
    items: [],
    activeConversationId: null,
    loading: false,
    error: null,
  },

  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload
    },

    clearActiveConversation: (state) => {
      state.activeConversationId = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload

        if (
          state.activeConversationId &&
          !action.payload.some(
            (item) => item._id === state.activeConversationId
          )
        ) {
          state.activeConversationId = null
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setActiveConversation,
  clearActiveConversation,
} = conversationSlice.actions

export default conversationSlice.reducer
