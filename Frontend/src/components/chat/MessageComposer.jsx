
import { useState } from 'react'
import { Paperclip, Send, Smile } from 'lucide-react'

export default function MessageComposer({
  onSend,
  sending,
}) {
  const [content, setContent] = useState('')


  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = content.trim();

    if (!trimmed || sending) return;

    try {
      await onSend(trimmed);
      setContent("");
    } catch (error) {
      console.error("Message send failed:", error);
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t-2 border-black
        bg-white p-3 md:p-5"
    >
      <div className="flex items-center gap-2 border-2
        border-black bg-[#FFFDF7] p-2">

        <button
          type="button"
          title="Attachments coming soon"
          className="flex h-9 w-9 shrink-0 items-center
            justify-center hover:bg-[#C7B8FF]"
        >
          <Paperclip size={19} />
        </button>

        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something worth saying..."
          className="min-w-0 flex-1 bg-transparent px-1
            py-3 text-sm font-semibold outline-none"
          maxLength={5000}
        />

        <button
          type="button"
          title="Emoji coming soon"
          className="hidden h-9 w-9 shrink-0 items-center
            justify-center hover:bg-[#F9E547] sm:flex"
        >
          <Smile size={19} />
        </button>

        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center
            justify-center border-2 border-black
            bg-[#F9E547] transition
            hover:translate-x-0.5 hover:translate-y-0.5
            hover:shadow-none
            disabled:cursor-not-allowed disabled:opacity-40
            shadow-[3px_3px_0px_#171717]"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>

      <p className="mt-2 text-right text-[9px]
        font-bold uppercase tracking-widest text-neutral-400">
        ENTER TO SEND · {content.length}/5000
      </p>
    </form>
  )
}
