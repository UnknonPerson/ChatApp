
import { CheckCheck } from 'lucide-react'

function getOtherParticipant(conversation, currentUserId) {
  return conversation.participants?.find(
    (participant) => participant._id !== currentUserId
  ) || conversation.participants?.[0]
}

function formatTime(date) {
  if (!date) return ''

  const messageDate = new Date(date)

  if (Number.isNaN(messageDate.getTime())) return ''

  return messageDate.toDateString() === new Date().toDateString()
    ? messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : messageDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
}

export default function ConversationItem({
  conversation,
  currentUserId,
  active,
  onClick,
}) {
  const otherUser = getOtherParticipant(conversation, currentUserId)
  const lastMessage = conversation.lastMessage

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b
        border-black/10 p-4 text-left transition
        ${active
          ? 'bg-[#F9E547]'
          : 'bg-transparent hover:bg-[#F3EDDD]'
        }`}
    >
      <div className="relative h-12 w-12 shrink-0 border-2
        border-black bg-[#C7B8FF]">
        {otherUser?.profilePicture ? (
          <img
            src={otherUser.profilePicture}
            alt={otherUser.username}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center
            text-lg font-black">
            {otherUser?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-black">
            {otherUser?.username || 'Unknown user'}
          </h3>

          <span className="shrink-0 text-[10px] font-bold text-neutral-500">
            {formatTime(lastMessage?.createdAt || conversation.updatedAt)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-neutral-600">
            {lastMessage?.content || 'Start a conversation'}
          </p>
          {lastMessage && <CheckCheck size={14} className="shrink-0" />}
        </div>
      </div>
    </button>
  )
}
