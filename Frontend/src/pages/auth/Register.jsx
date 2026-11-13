
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { register, clearAuthError } from '../../features/auth/authSlice'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setValidationError('')
    dispatch(clearAuthError())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.username.trim().length < 3) {
      return setValidationError('Username must have at least 3 characters.')
    }

    if (form.password.length < 8) {
      return setValidationError('Password must have at least 8 characters.')
    }

    if (form.password !== form.confirmPassword) {
      return setValidationError('Passwords do not match.')
    }

    const result = await dispatch(register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    }))

    if (register.fulfilled.match(result)) {
      navigate('/login', {
        replace: true,
        state: { registered: true },
      })
    }
  }

  return (
    <AuthLayout mode="register">
      <div className="mb-7">
        <p className="mb-3 text-xs font-black uppercase
          tracking-[0.2em] text-neutral-500">
          Join the conversation / 002
        </p>

        <h2 className="text-5xl font-black tracking-[-0.06em]">
          SIGN UP<span className="text-[#FF8066]">.</span>
        </h2>

        <p className="mt-3 text-sm font-medium text-neutral-600">
          Create your space. Find your people.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          icon={User}
          name="username"
          type="text"
          placeholder="Your username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          minLength={3}
          required
        />

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
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
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

        <Input
          label="Confirm password"
          icon={Lock}
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password again"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        {(validationError || error) && (
          <div role="alert" className="border-2 border-[#FF8066]
            bg-[#FFE0D8] p-3 text-sm font-bold">
            {validationError || error}
          </div>
        )}

        <Button type="submit" loading={loading}>
          CREATE ACCOUNT <span className="text-xl">→</span>
        </Button>
      </form>

      <p className="mt-5 text-center text-xs font-medium
        leading-5 text-neutral-500">
        By creating an account, you agree to use NeoChat
        responsibly and respectfully.
      </p>

      <div className="mt-6 text-center text-sm font-bold">
        Already have an account?{' '}
        <Link to="/login" className="underline decoration-2
          underline-offset-4 hover:text-[#D94C35]">
          Login here
        </Link>
      </div>
    </AuthLayout>
  )
}
