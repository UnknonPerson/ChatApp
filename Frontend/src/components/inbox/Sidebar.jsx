
import {
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Plus,
  Zap,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = async () => {
    const result = await dispatch(logout())
    if (logout.fulfilled.match(result)) {
      navigate('/login', { replace: true })
    }
  }

  const avatar = user?.profilePicture

  return (
    <aside className="flex w-full shrink-0 flex-row items-center
      justify-between border-b-2 border-black bg-[#171717]
      p-3 text-white lg:h-full lg:w-[88px] lg:flex-col
      lg:justify-start lg:gap-10 lg:border-b-0 lg:border-r-2
      lg:p-4">

      <div className="flex h-12 w-12 shrink-0 items-center
        justify-center border-2 border-black bg-[#F9E547]
        text-black shadow-[3px_3px_0px_white]">
        <Zap size={25} fill="black" />
      </div>

      <nav className="flex items-center gap-2 lg:flex-col lg:gap-5">
        <button title="Inbox" className="flex h-12 w-12
          items-center justify-center border-2 border-black
          bg-[#F9E547] text-black">
          <MessageSquare size={22} />
        </button>

        <button title="Contacts" className="flex h-12 w-12
          items-center justify-center text-neutral-400
          transition hover:bg-white/10 hover:text-white">
          <Users size={22} />
        </button>

        <button title="Settings" className="flex h-12 w-12
          items-center justify-center text-neutral-400
          transition hover:bg-white/10 hover:text-white">
          <Settings size={22} />
        </button>
      </nav>

      <div className="flex items-center gap-3 lg:mt-auto lg:flex-col">
        <div className="h-11 w-11 overflow-hidden border-2
          border-white bg-[#C7B8FF]">
          {avatar ? (
            <img src={avatar} alt="Profile" className="h-full w-full object-cover"/>
          ) : (
            <div className="flex h-full items-center justify-center
              text-lg font-black text-black">
              {user?.username?.charAt(0)?.toUpperCase() || 'N'}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="flex h-10 w-10 items-center justify-center
            text-neutral-400 hover:bg-[#FF8066] hover:text-black"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  )
}
