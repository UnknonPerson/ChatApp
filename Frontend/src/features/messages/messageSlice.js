
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  fetchMessagesAPI,
  sendMessageAPI,
} from './messageAPI'

export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async ({ conversationId, page = 1 }, { rejectWithValue }) => {
    try {
      return {
        conversationId,
        ...(await fetchMessagesAPI({ conversationId, page })),
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load messages'
      )
    }
  }
)

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (payload, { rejectWithValue }) => {
    try {
      return {
        conversationId: payload.conversationId,
        message: await sendMessageAPI(payload),
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send message'
      )
    }
  }
)

const initialState = {
  messagesByConversation: {},
  paginationByConversation: {},
  loading: false,
  sending: false,
  error: null,
}

const messageSlice = createSlice({
  name: 'messages',
  initialState,

  reducers: {
    clearMessagesError: (state) => {
      state.error = null
    },

    addIncomingMessage: (state, action) => {
      const { conversationId, message } = action.payload
      const id = String(conversationId)

      if (!state.messagesByConversation[id]) {
        state.messagesByConversation[id] = []
      }

      const messages = state.messagesByConversation[id]

      const exists = messages.some(
        (item) => String(item._id) === String(message._id)
      )

      if (!exists) {
        messages.push(message)
      }
    },

    updateMessageDelivery: (state, action) => {
      const { messageId, userId, deliveredAt } = action.payload

      Object.values(state.messagesByConversation).forEach((messages) => {
        const message = messages.find(
          (item) => String(item._id) === String(messageId)
        )

        if (!message) return

        const receipt = message.receipts?.find(
          (item) =>
            String(item.user?._id || item.user) === String(userId)
        )

        if (receipt) {
          receipt.deliveredAt = deliveredAt
        }
      })
    },

    markMessagesRead: (state, action) => {
      const { conversationId, messageIds, userId, readAt } = action.payload

      const messages =
        state.messagesByConversation[String(conversationId)] || []

      messages.forEach((message) => {
        const isTargetMessage = messageIds.some(
          (id) => String(id) === String(message._id)
        )

        if (!isTargetMessage) return

        const receipt = message.receipts?.find(
          (item) =>
            String(item.user?._id || item.user) === String(userId)
        )

        if (receipt) {
          receipt.readAt = readAt
        }
      })
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false

        const {
          conversationId,
          messages,
          pagination,
        } = action.payload

        const id = String(conversationId)
        const existing = state.messagesByConversation[id] || []

        if (pagination.currentPage === 1) {
          state.messagesByConversation[id] = messages
        } else {
          const existingIds = new Set(
            existing.map((message) => String(message._id))
          )

          state.messagesByConversation[id] = [
            ...messages.filter(
              (message) => !existingIds.has(String(message._id))
            ),
            ...existing,
          ]
        }

        state.paginationByConversation[id] = pagination
      })

      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(sendMessage.pending, (state) => {
        state.sending = true
        state.error = null
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false

        const { conversationId, message } = action.payload
        const id = String(conversationId)

        if (!state.messagesByConversation[id]) {
          state.messagesByConversation[id] = []
        }

        const messages = state.messagesByConversation[id]

        if (!messages.some(
          (item) => String(item._id) === String(message._id)
        )) {
          messages.push(message)
        }
      })

      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false
        state.error = action.payload
      })
  },
})

export const {
  clearMessagesError,
  addIncomingMessage,
  updateMessageDelivery,
  markMessagesRead,
} = messageSlice.actions

export default messageSlice.reducer
