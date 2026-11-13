
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import AppRoutes from './routes/AppRoutes'
import { fetchProfile } from './features/auth/authSlice'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  return <AppRoutes />
}
