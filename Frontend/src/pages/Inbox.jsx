
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Sidebar from '../components/inbox/Sidebar'
import ConversationList from '../components/inbox/ConversationList'
import ChatPanel from '../components/inbox/ChatPanel'

import {
  fetchConversations,
  clearActiveConversation,
} from '../features/conversations/conversationSlice'

import useSocket from '../hooks/useSocket'

export default function Inbox() {
  const dispatch = useDispatch()

  useSocket()

  const { activeConversationId } = useSelector(
    (state) => state.conversations
  )

  useEffect(() => {
    dispatch(fetchConversations())
  }, [dispatch])

  return (
    <main className="h-dvh overflow-hidden bg-[#F5F0E8] md:p-3 lg:p-5">
      <div
        className="mx-auto flex h-full w-full max-w-[1800px]
        overflow-hidden border-0 border-black bg-white
        md:border-2 md:shadow-[7px_7px_0px_#171717]"
      >
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1">
          {/* Conversation list */}
          <div
            className={`h-full min-h-0 w-full lg:flex lg:w-auto
              ${activeConversationId ? 'hidden' : 'flex'}`}
          >
            <ConversationList />
          </div>

          {/* Chat workspace */}
          <div
            className={`min-h-0 min-w-0 flex-1
              ${activeConversationId ? 'flex' : 'hidden lg:flex'}`}
          >
            <ChatPanel
              onBack={() => dispatch(clearActiveConversation())}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
