
import { useMemo, useState } from 'react'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import ConversationItem from './ConversationItem'
import { setActiveConversation } from '../../features/conversations/conversationSlice'

export default function ConversationList() {
  const dispatch = useDispatch()

  const { items, activeConversationId, loading, error } = useSelector(
    (state) => state.conversations
  )

  const currentUser = useSelector((state) => state.auth.user)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredConversations = useMemo(() => {
    return items.filter((conversation) => {
      const otherUser = conversation.participants?.find(
        (p) => p._id !== currentUser?._id
      ) || conversation.participants?.[0]

      const matchesSearch = otherUser?.username
        ?.toLowerCase()
        .includes(search.toLowerCase())

      // Unread filtering will be enabled when the backend
      // exposes an unread-count field.
      return matchesSearch && filter === 'all'
    })
  }, [items, currentUser, search, filter])

  return (
    <section className="flex h-full min-h-0 w-full flex-col
      border-r-2 border-black bg-[#FFFDF7] lg:w-[340px]
      xl:w-[390px]">

      <header className="border-b-2 border-black p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase
              tracking-[0.2em] text-neutral-500">
              Your space / 001
            </p>
            <h1 className="mt-1 text-3xl font-black
              tracking-[-0.06em]">
              MESSAGES<span className="text-[#FF8066]">.</span>
            </h1>
          </div>

          <button
            title="New conversation"
            className="flex h-11 w-11 items-center justify-center
              border-2 border-black bg-[#F9E547]
              shadow-[3px_3px_0px_#171717]
              transition hover:translate-x-0.5 hover:translate-y-0.5
              hover:shadow-none"
          >
            <Plus size={22} strokeWidth={3} />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 border-2
          border-black bg-white px-3">
          <Search size={18} className="shrink-0 text-neutral-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="min-w-0 flex-1 bg-transparent py-3
              text-xs font-semibold outline-none"
          />
          <SlidersHorizontal size={16} className="shrink-0" />
        </div>

        <div className="mt-4 flex gap-2">
          {['all', 'unread'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`border-2 border-black px-4 py-2
                text-[10px] font-black uppercase tracking-wider
                ${filter === item
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
                }`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-5
          pb-2 pt-5">
          <span className="text-[10px] font-black uppercase
            tracking-[0.15em] text-neutral-500">
            Recent conversations
          </span>
          <span className="text-[10px] font-bold text-neutral-400">
            {items.length} CHATS
          </span>
        </div>

        {loading && (
          <p className="p-6 text-xs font-bold text-neutral-500">
            LOADING CONVERSATIONS...
          </p>
        )}

        {error && (
          <p role="alert" className="m-4 border-2 border-[#FF8066]
            bg-[#FFE0D8] p-3 text-xs font-bold">
            {error}
          </p>
        )}

        {!loading && !error && filteredConversations.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14
              items-center justify-center border-2 border-black
              bg-[#C7B8FF]">
              <Search size={24} />
            </div>
            <p className="font-black">NO CHATS FOUND.</p>
            <p className="mt-2 text-xs text-neutral-500">
              Try another search or start a new conversation.
            </p>
          </div>
        )}


        {filteredConversations.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            currentUserId={currentUser?._id}
            active={
              String(activeConversationId) === String(conversation._id)
            }
            onClick={() => {
              console.log('CLICKED CONVERSATION:', conversation._id)

              dispatch(setActiveConversation(conversation._id))

              console.log('DISPATCHING CONVERSATION:', conversation._id)
            }}
          />
        ))}
      </div>

      <footer className="border-t-2 border-black bg-[#F9E547]
        px-5 py-3">
        <p className="text-[10px] font-black uppercase
          tracking-widest">
          GOOD CONVERSATIONS START HERE ✳
        </p>
      </footer>
    </section>
  )
}
