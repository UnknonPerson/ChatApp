
import { Check, CheckCheck } from 'lucide-react'

export default function MessageBubble({ message, isOwn }) {
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  // Determine status across all recipients.
  const receipts = message.receipts || []

  const isRead =
    receipts.length > 0 &&
    receipts.every((receipt) => receipt.readAt)

  const isDelivered =
    receipts.length > 0 &&
    receipts.every((receipt) => receipt.deliveredAt)

  const status = isRead
    ? 'read'
    : isDelivered
      ? 'delivered'
      : 'sent'

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] md:max-w-[65%]
          border-2 border-black px-4 py-3
          shadow-[3px_3px_0px_#171717]
          ${isOwn ? 'bg-[#F9E547]' : 'bg-white'}`}
      >
        {!isOwn && (
          <p className="mb-1 text-[10px] font-black uppercase
            tracking-wider text-[#765BC7]">
            {message.sender?.username || 'User'}
          </p>
        )}

        <p className="whitespace-pre-wrap break-words text-sm
          font-medium leading-6">
          {message.content}
        </p>

        <div className="mt-2 flex items-center justify-end gap-1
          text-[9px] font-bold text-neutral-500">
          <span>{time}</span>

          {isOwn && (
            <>
              {status === 'sent' && (
                <Check size={14} aria-label="Sent" />
              )}

              {status === 'delivered' && (
                <CheckCheck
                  size={14}
                  className="text-neutral-500"
                  aria-label="Delivered"
                />
              )}

              {status === 'read' && (
                <CheckCheck
                  size={14}
                  className="text-[#765BC7]"
                  aria-label="Read"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
