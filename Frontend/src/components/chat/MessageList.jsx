
import { useEffect, useRef } from 'react'
import { getSocket } from '../../services/socket'
import MessageBubble from './MessageBubble'

export default function MessageList({
  messages,
  currentUserId,
  loading,
}) {
  const bottomRef = useRef(null)

  // Acknowledge incoming messages when received by this client.
  useEffect(() => {
    const socket = getSocket()

    if (!socket || !currentUserId) return

    const acknowledgePendingMessages = () => {
      messages.forEach((message) => {
        const senderId =
          typeof message.sender === 'object'
            ? message.sender?._id
            : message.sender

        // Never acknowledge our own messages.
        if (String(senderId) === String(currentUserId)) return

        // Find this user's delivery receipt.
        const receipt = message.receipts?.find(
          (item) =>
            String(item.user?._id || item.user) === String(currentUserId)
        )

        // Only acknowledge messages not yet delivered.
        if (receipt && !receipt.deliveredAt) {
          socket.emit('message_delivered', String(message._id))
        }
      })
    }

    if (socket.connected) {
      acknowledgePendingMessages()
    }

    // Retry pending acknowledgements after reconnection.
    socket.on('connect', acknowledgePendingMessages)

    return () => {
      socket.off('connect', acknowledgePendingMessages)
    }
  }, [messages, currentUserId])

  // Scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages.length])

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center
        font-black tracking-wider">
        LOADING MESSAGES...
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto
      p-4 md:p-6">

      {messages.length === 0 && (
        <div className="m-auto text-center">
          <p className="text-2xl font-black">SAY HELLO! ✳</p>
          <p className="mt-2 text-xs text-neutral-500">
            This is the beginning of your conversation.
          </p>
        </div>
      )}

      {messages.map((message) => {
        const senderId =
          typeof message.sender === 'object'
            ? message.sender?._id
            : message.sender

        return (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={String(senderId) === String(currentUserId)}
          />
        )
      })}

      <div ref={bottomRef} />
    </div>
  )
}
