
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  MessageSquare,
  ArrowLeft,
  MoreHorizontal,
} from 'lucide-react'

import {
  fetchMessages,
} from '../../features/messages/messageSlice'

import { getSocket } from '../../services/socket'
import MessageList from '../chat/MessageList'
import MessageComposer from '../chat/MessageComposer'

export default function ChatPanel({ onBack }) {
  const dispatch = useDispatch()

  const { items, activeConversationId } = useSelector(
    (state) => state.conversations
  )

  const { user } = useSelector((state) => state.auth)

  const {
    messagesByConversation,
    paginationByConversation,
    loading,
    sending,
    error,
  } = useSelector((state) => state.messages)

  const conversation = items.find(
    (item) => String(item._id) === String(activeConversationId)
  )

  const conversationId = conversation?._id

  const messages = conversationId
    ? messagesByConversation[conversationId] || []
    : []

  const pagination = conversationId
    ? paginationByConversation[conversationId]
    : null

  const otherUser = conversation?.participants?.find(
    (participant) => String(participant._id) !== String(user?._id)
  ) || conversation?.participants?.[0]

  // Join the selected conversation room.
  useEffect(() => {
    if (!conversationId) return

    const socket = getSocket()
    if (!socket) return

    const joinRoom = () => {
      console.log('Joining conversation room:', conversationId)

      socket.emit('join_conversation', String(conversationId))
    }

    if (socket.connected) {
      joinRoom()
    }

    socket.on('connect', joinRoom)

    return () => {
      socket.off('connect', joinRoom)
    }
  }, [conversationId])

  // Fetch messages for the selected conversation.
  useEffect(() => {
    if (
      conversationId &&
      !messagesByConversation[conversationId]
    ) {
      dispatch(fetchMessages({
        conversationId,
        page: 1,
      }))
    }
  }, [conversationId, dispatch, messagesByConversation])

  // Mark incoming messages as read.
  useEffect(() => {
    if (!conversationId || !user?._id) return

    const socket = getSocket()
    if (!socket) return

    const markAsRead = () => {
      const unreadMessageIds = messages
        .filter((message) => {
          const senderId =
            typeof message.sender === 'object'
              ? message.sender?._id
              : message.sender

          // Ignore messages sent by the current user.
          if (String(senderId) === String(user._id)) {
            return false
          }

          const receipt = message.receipts?.find(
            (item) =>
              String(item.user?._id || item.user) === String(user._id)
          )

          return receipt && !receipt.readAt
        })
        .map((message) => String(message._id))

      if (!unreadMessageIds.length) return

      // Backend accepts up to 100 message IDs per event.
      for (let i = 0; i < unreadMessageIds.length; i += 100) {
        socket.emit('mark_messages_read', {
          conversationId: String(conversationId),
          messageIds: unreadMessageIds.slice(i, i + 100),
        })
      }
    }

    if (socket.connected) {
      markAsRead()
    }

    socket.on('connect', markAsRead)

    return () => {
      socket.off('connect', markAsRead)
    }
  }, [conversationId, messages, user?._id])

  // Send message with server acknowledgement.
  const handleSend = (content) => {
    return new Promise((resolve, reject) => {
      const socket = getSocket()

      if (!socket?.connected) {
        reject(new Error('Connection lost. Please reconnect.'))
        return
      }

      socket.timeout(10000).emit(
        'send_message',
        {
          conversationId: String(conversationId),
          content,
        },
        (error, response) => {
          if (error) {
            reject(new Error('Message confirmation timed out.'))
            return
          }

          if (!response?.success) {
            reject(
              new Error(response?.message || 'Message failed.')
            )
            return
          }

          resolve(response.data)
        }
      )
    })
  }

  // Load older messages.
  const handleLoadOlder = () => {
    if (!conversationId || !pagination?.hasNextPage || loading) {
      return
    }

    dispatch(fetchMessages({
      conversationId,
      page: pagination.currentPage + 1,
    }))
  }

  if (!conversation) {
    return (
      <section
        className="hidden flex-1 items-center justify-center
          bg-[#F5F0E8] lg:flex"
      >
        <div className="text-center">
          <MessageSquare size={55} className="mx-auto mb-5" />

          <h2 className="text-3xl font-black">
            YOUR SPACE. YOUR PEOPLE.
          </h2>

          <p className="mt-3 text-sm text-neutral-500">
            Select a conversation to start messaging.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="flex min-h-0 min-w-0 flex-1 flex-col
        bg-[#F5F0E8]"
    >
      {/* Header */}
      <header
        className="flex shrink-0 items-center
          justify-between border-b-2 border-black
          bg-white px-4 py-4 md:px-6"
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center
              justify-center lg:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={21} />
          </button>

          <div
            className="flex h-11 w-11 shrink-0
              items-center justify-center overflow-hidden
              border-2 border-black bg-[#C7B8FF] font-black"
          >
            {otherUser?.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.username}
                className="h-full w-full object-cover"
              />
            ) : (
              otherUser?.username?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-black">
              {otherUser?.username || 'Unknown user'}
            </h2>

            <p
              className="text-[10px] font-bold uppercase
                tracking-wider text-neutral-500"
            >
              NEOCHAT CONVERSATION
            </p>
          </div>
        </div>

        <button
          className="flex h-10 w-10 items-center
            justify-center hover:bg-[#F9E547]"
          aria-label="More options"
        >
          <MoreHorizontal size={22} />
        </button>
      </header>

      {/* Load older messages */}
      {pagination?.hasNextPage && (
        <button
          onClick={handleLoadOlder}
          disabled={loading}
          className="mx-auto mt-3 border-2 border-black
            bg-white px-4 py-2 text-xs font-black
            shadow-[3px_3px_0px_#171717]"
        >
          {loading ? 'LOADING...' : 'LOAD OLDER MESSAGES'}
        </button>
      )}

      {/* Message list */}
      <MessageList
        messages={messages}
        currentUserId={user?._id}
        loading={loading}
      />

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mx-4 mb-2 border-2
            border-[#FF8066] bg-[#FFE0D8] p-3
            text-xs font-bold"
        >
          {error}
        </div>
      )}

      {/* Composer */}
      <MessageComposer
        onSend={handleSend}
        sending={sending}
      />
    </section>
  )
}
