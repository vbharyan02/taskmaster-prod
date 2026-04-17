import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

const CATEGORIES = ['food', 'travel', 'shopping', 'bills', 'other']

export default function MainPage() {
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [filterCategory, setFilterCategory] = useState('all')
  const [createError, setCreateError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchExpenses() }, [])

  async function fetchExpenses() {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          setError('Database not set up yet. Please run schema.sql in Supabase.')
        } else {
          setError(error.message)
        }
        return
      }
      setExpenses(data)
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('expenses')
        .insert({ title, amount: parseFloat(amount), category, date, user_id: user.id })
        .select()
        .single()
      if (error) { setCreateError(error.message); return }
      setTitle(''); setAmount(''); setCategory('food')
      setDate(new Date().toISOString().slice(0, 10))
      fetchExpenses()
    } catch {
      setCreateError('Connection error. Please try again.')
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const filtered = filterCategory === 'all' ? expenses : expenses.filter(e => e.category === filterCategory)
  const total = filtered.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)

  if (isLoading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required min="0" step="0.01"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
        {createError && <p className="text-red-500 text-sm">{createError}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Add Expense
        </button>
      </form>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1 rounded text-sm border ${filterCategory === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mb-4 font-medium text-gray-700">
        Total: ${total.toFixed(2)}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No expenses yet. Create your first one above.
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map(exp => (
            <li key={exp.id} className="flex justify-between items-center border rounded px-3 py-2">
              <div>
                <span className="font-medium">{exp.title}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ${parseFloat(exp.amount).toFixed(2)} · {exp.category} · {exp.date}
                </span>
              </div>
              <button onClick={() => handleDelete(exp.id)} className="text-red-500 text-sm ml-4">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
