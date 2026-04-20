import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function MainPage() {
  const [workouts, setWorkouts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formName, setFormName] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formDuration, setFormDuration] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchWorkouts() }, [])

  async function fetchWorkouts() {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        if (
          error.message.includes('does not exist') ||
          error.message.includes('schema cache') ||
          error.message.includes('relation') ||
          error.message.includes('Could not find')
        ) {
          setError('Something went wrong. Please try again later.')
        } else {
          setError(error.message)
        }
        return
      }
      setWorkouts(data)
    } catch (err) {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError(null)
    if (!formName.trim()) { setFormError('Workout name is required'); return }
    if (!formDate) { setFormError('Date is required'); return }
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: formName.trim(),
          date: formDate,
          duration_minutes: formDuration ? parseInt(formDuration) : null,
          notes: formNotes.trim() || null,
        })
        .select()
        .single()
      if (error) { setFormError(error.message); return }
      setWorkouts(prev => [data, ...prev])
      setFormName('')
      setFormDate('')
      setFormDuration('')
      setFormNotes('')
    } catch (err) {
      setFormError('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Workouts</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 mb-8 p-4 border rounded">
        <h2 className="font-semibold">Log a Workout</h2>
        <input
          type="text"
          placeholder="Workout name *"
          value={formName}
          onChange={e => setFormName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="date"
          value={formDate}
          onChange={e => setFormDate(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="number"
          placeholder="Duration (minutes, optional)"
          value={formDuration}
          onChange={e => setFormDuration(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          min="1"
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={formNotes}
          onChange={e => setFormNotes(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Add Workout'}
        </button>
      </form>

      {workouts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No workouts yet. Log your first one above.
        </div>
      ) : (
        <ul className="space-y-3">
          {workouts.map(workout => (
            <li key={workout.id} className="flex justify-between items-start border rounded px-4 py-3">
              <div>
                <p className="font-medium">{workout.name}</p>
                <p className="text-sm text-gray-600">{workout.date}</p>
                {workout.duration_minutes && (
                  <p className="text-xs text-gray-400 mt-1">{workout.duration_minutes} min</p>
                )}
                {workout.notes && (
                  <p className="text-xs text-gray-400">{workout.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(workout.id)}
                className="text-red-500 text-sm ml-4 shrink-0"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
