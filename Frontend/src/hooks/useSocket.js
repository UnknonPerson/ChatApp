
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { connectSocket } from '../services/socket'

import {
  addIncomingMessage,
  updateMessageDelivery,
  markMessagesRead,
} from '../features/messages/messageSlice'

export default function useSocket() {
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = connectSocket()

    const handleNewMessage = (message) => {
      const conversationId = String(
        message.conversation?._id || message.conversation
      )

      dispatch(addIncomingMessage({
        conversationId,
        message,
      }))
    }

    const handleDelivery = (data) => {
      dispatch(updateMessageDelivery(data))
    }

    const handleRead = (data) => {
      dispatch(markMessagesRead(data))
    }

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error.message)
    }

    socket.on('new_message', handleNewMessage)
    socket.on('message_status_updated', handleDelivery)
    socket.on('messages_read', handleRead)
    socket.on('connect_error', handleConnectError)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('message_status_updated', handleDelivery)
      socket.off('messages_read', handleRead)
      socket.off('connect_error', handleConnectError)
    }
  }, [dispatch])
}
