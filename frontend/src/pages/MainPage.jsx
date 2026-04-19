import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

const TODAY = new Date().toISOString().split('T')[0]

function computeStreak(completions) {
  const dates = [...new Set(completions.map(c => c.completed_date))].sort().reverse()
  let streak = 0
  let cursor = new Date(TODAY)
  for (const d of dates) {
    const expected = cursor.toISOString().split('T')[0]
    if (d === expected) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (d < expected) {
      break
    }
  }
  return streak
}

export default function MainPage() {
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setIsLoading(true)
    setError(null)
    try {
      const [{ data: h, error: he }, { data: c, error: ce }] = await Promise.all([
        supabase.from('habits').select('*').order('created_at', { ascending: false }),
        supabase.from('habit_completions').select('*')
      ])
      if (he || ce) {
        const msg = (he || ce).message
        setError(
          msg.includes('does not exist') || msg.includes('schema cache') ||
          msg.includes('relation') || msg.includes('Could not find')
            ? 'Something went wrong. Please try again later.'
            : msg
        )
        return
      }
      setHabits(h || [])
      setCompletions(c || [])
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) { setFormError('Name is required'); return }
    setFormError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('habits')
        .insert({ name: name.trim(), description: description.trim() || null, frequency: frequency || 'daily', user_id: user.id })
        .select().single()
      if (error) { setFormError(error.message); return }
      setHabits([data, ...habits])
      setName('')
      setDescription('')
      setFrequency('daily')
    } catch {
      setFormError('Connection error. Please try again.')
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setHabits(habits.filter(h => h.id !== id))
    setCompletions(completions.filter(c => c.habit_id !== id))
  }

  async function handleComplete(habit) {
    const already = completions.some(c => c.habit_id === habit.id && c.completed_date === TODAY)
    if (already) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({ habit_id: habit.id, user_id: user.id, completed_date: TODAY })
        .select().single()
      if (error) { setError(error.message); return }
      setCompletions([...completions, data])
    } catch {
      setError('Connection error. Please try again.')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Habits</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 mb-8">
        <input
          type="text"
          placeholder="Habit name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <select
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="daily">Daily</option>
        </select>
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Add Habit
        </button>
      </form>

      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No habits yet. Create your first one above.
        </div>
      ) : (
        <ul className="space-y-2">
          {habits.map(habit => {
            const habitCompletions = completions.filter(c => c.habit_id === habit.id)
            const streak = computeStreak(habitCompletions)
            const doneToday = habitCompletions.some(c => c.completed_date === TODAY)
            return (
              <li key={habit.id} className="flex justify-between items-start border rounded px-3 py-3">
                <div className="flex-1">
                  <p className="font-medium">{habit.name}</p>
                  {habit.description && <p className="text-sm text-gray-500">{habit.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">Streak: {streak} day{streak !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleComplete(habit)}
                    disabled={doneToday}
                    className={`text-sm px-2 py-1 rounded ${doneToday ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                  >
                    {doneToday ? 'Done today' : 'Mark done'}
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
