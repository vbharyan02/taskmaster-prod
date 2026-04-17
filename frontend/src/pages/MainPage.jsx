import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import supabase from '../lib/supabase'
import useAuthStore from '../store/authStore'

function formatTime(secs) {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0')
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function MainPage() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createError, setCreateError] = useState('')
  const timerRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const running = entries.find(e => e.is_running)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => { if (user) fetchAll() }, [user])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(running.start_time).getTime()) / 1000))
      }, 1000)
    } else {
      clearInterval(timerRef.current)
      setElapsed(0)
    }
    return () => clearInterval(timerRef.current)
  }, [running?.id])

  async function fetchAll() {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        setError(error.message.includes('does not exist') || error.message.includes('schema cache')
          ? 'Something went wrong. Please try again later.'
          : error.message)
        return
      }
      setEntries(data || [])
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function startTimer(title) {
    if (!title.trim()) { setCreateError('Enter a title first.'); return }
    setCreateError('')
    try {
      const { data, error } = await supabase.from('time_entries').insert({
        title,
        start_time: new Date().toISOString(),
        is_running: true,
        user_id: user.id
      }).select().single()
      if (error) { setCreateError(error.message); return }
      setEntries(prev => [data, ...prev])
    } catch {
      setCreateError('Connection error. Please try again.')
    }
  }

  async function stopTimer() {
    const now = new Date()
    const durationMinutes = Math.round((now - new Date(running.start_time)) / 60000)
    const { data, error } = await supabase.from('time_entries').update({
      end_time: now.toISOString(),
      is_running: false,
      duration_minutes: durationMinutes
    }).eq('id', running.id).select().single()
    if (error) { setError(error.message); return }
    setEntries(prev => prev.map(e => e.id === running.id ? data : e))
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('time_entries').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setEntries(prev => prev.filter(e => e.id !== id))
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
        <h1 className="text-2xl font-bold">Time Tracker</h1>
        <div className="space-x-3">
          <Link to="/tasks" className="text-blue-600 underline text-sm">Tasks</Link>
          <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
        </div>
      </div>

      {running ? (
        <div className="border rounded p-4 mb-6 bg-blue-50">
          <div className="text-sm text-gray-500 mb-1">Running: {running.title}</div>
          <div className="text-3xl font-mono font-bold mb-3">{formatTime(elapsed)}</div>
          <button onClick={stopTimer} className="bg-red-600 text-white px-4 py-2 rounded">Stop Timer</button>
        </div>
      ) : (
        <TimerForm onStart={startTimer} createError={createError} />
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No time entries yet. Start your first timer above.</div>
      ) : (
        <ul className="space-y-2">
          {entries.map(e => (
            <li key={e.id} className="flex justify-between items-center border rounded px-3 py-2">
              <div>
                <span className="font-medium">{e.title}</span>
                {e.is_running && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1 rounded">Running</span>}
                <div className="text-sm text-gray-500">
                  {e.duration_minutes != null ? `${e.duration_minutes}m` : e.is_running ? 'In progress' : '—'}
                  {e.start_time && ` · ${new Date(e.start_time).toLocaleDateString()}`}
                </div>
              </div>
              <button onClick={() => handleDelete(e.id)} className="text-red-500 text-sm ml-4">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TimerForm({ onStart, createError }) {
  const [title, setTitle] = useState('')
  return (
    <div className="border rounded p-4 mb-6 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="What are you working on?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
      </div>
      {createError && <p className="text-red-500 text-sm">{createError}</p>}
      <button onClick={() => { onStart(title); setTitle('') }} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Start Timer
      </button>
    </div>
  )
}
