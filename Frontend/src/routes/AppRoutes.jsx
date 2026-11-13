import Inbox from '../pages/Inbox'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  )

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center
        bg-[#F5F0E8] font-black">
        LOADING NEOCHAT...
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function InboxPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center
      bg-[#F5F0E8]">
      <h1 className="text-5xl font-black">
        INBOX COMING SOON.
      </h1>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
