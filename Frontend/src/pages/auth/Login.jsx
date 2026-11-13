
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { login, clearAuthError } from '../../features/auth/authSlice'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    dispatch(clearAuthError())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email.trim() || !form.password) return

    const result = await dispatch(login({
      email: form.email.trim(),
      password: form.password,
    }))

    if (login.fulfilled.match(result)) {
      navigate('/app', { replace: true })
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="mb-8">
        <p className="mb-3 text-xs font-black uppercase
          tracking-[0.2em] text-neutral-500">
          Welcome back / 001
        </p>

        <h2 className="text-5xl font-black tracking-[-0.06em]">
          LOGIN<span className="text-[#FF8066]">.</span>
        </h2>

        <p className="mt-3 text-sm font-medium text-neutral-600">
          Your people are just one message away.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          icon={Mail}
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <div className="relative">
          <Input
            label="Password"
            icon={Lock}
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute bottom-3.5 right-3
              text-neutral-500 hover:text-black"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {error && (
          <div role="alert" className="border-2 border-[#FF8066]
            bg-[#FFE0D8] p-3 text-sm font-bold">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading}>
          LET'S GET IN <span className="text-xl">→</span>
        </Button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-[2px] flex-1 bg-black/15" />
        <span className="text-xs font-black text-neutral-400">
          NEW TO NEOCHAT?
        </span>
        <div className="h-[2px] flex-1 bg-black/15" />
      </div>

      <Link
        to="/register"
        className="flex w-full justify-center border-2
          border-black bg-white px-5 py-3.5 text-sm
          font-black shadow-[4px_4px_0px_#171717]
          transition-all hover:translate-x-1 hover:translate-y-1
          hover:shadow-none"
      >
        CREATE YOUR ACCOUNT
      </Link>
    </AuthLayout>
  )
}
