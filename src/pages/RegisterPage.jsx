import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Name is required.'
    if (!email.trim()) errs.email = 'Email is required.'
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    setLoading(false)

    if (error) {
      setServerError(error.message)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Start tracking your expenses</p>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Jane Doe"
              disabled={loading}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="you@example.com"
              disabled={loading}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Min 6 characters"
              disabled={loading}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
