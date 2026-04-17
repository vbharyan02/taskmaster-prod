import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function MainPage() {
  const [entries, setEntries] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createError, setCreateError] = useState('')
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3b82f6')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  const running = entries.find(e => e.is_running)

  useEffect(() => { fetchAll() }, [])

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
      const [{ data: entriesData, error: e1 }, { data: catsData, error: e2 }] = await Promise.all([
        supabase.from('time_entries').select('*, categories(name, color)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name')
      ])
      if (e1) {
        setError(e1.message.includes('does not exist') || e1.message.includes('schema cache')
          ? 'Database not set up yet. Please run schema.sql in Supabase.'
          : e1.message)
        return
      }
      if (e2) { setError(e2.message); return }
      setEntries(entriesData || [])
      setCategories(catsData || [])
      if (catsData?.length > 0 && !categoryId) setCategoryId(catsData[0].id)
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function startTimer() {
    if (!title.trim()) { setCreateError('Enter a title first.'); return }
    setCreateError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('time_entries').insert({
        title,
        category_id: categoryId || null,
        start_time: new Date().toISOString(),
        is_running: true,
        user_id: user.id
      }).select().single()
      if (error) { setCreateError(error.message); return }
      setTitle('')
      fetchAll()
    } catch {
      setCreateError('Connection error. Please try again.')
    }
  }

  async function stopTimer() {
    const now = new Date()
    const durationMinutes = Math.round((now - new Date(running.start_time)) / 60000)
    const { error } = await supabase.from('time_entries').update({
      end_time: now.toISOString(),
      is_running: false,
      duration_minutes: durationMinutes
    }).eq('id', running.id)
    if (error) { setError(error.message); return }
    fetchAll()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('time_entries').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function addCategory(e) {
    e.preventDefault()
    if (!newCatName.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('categories').insert({
      name: newCatName, color: newCatColor, user_id: user.id
    }).select().single()
    if (error) { setCreateError(error.message); return }
    setNewCatName('')
    fetchAll()
  }

  async function deleteCategory(id) {
    await supabase.from('categories').delete().eq('id', id)
    fetchAll()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function formatTime(secs) {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0')
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Time Tracker</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>

      {running ? (
        <div className="border rounded p-4 mb-6 bg-blue-50">
          <div className="text-sm text-gray-500 mb-1">Running: {running.title}</div>
          <div className="text-3xl font-mono font-bold mb-3">{formatTime(elapsed)}</div>
          <button onClick={stopTimer} className="bg-red-600 text-white px-4 py-2 rounded">Stop Timer</button>
        </div>
      ) : (
        <div className="border rounded p-4 mb-6 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="What are you working on?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {createError && <p className="text-red-500 text-sm">{createError}</p>}
          <button onClick={startTimer} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Start Timer
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No time entries yet. Start your first timer above.</div>
      ) : (
        <ul className="space-y-2 mb-8">
          {entries.map(e => (
            <li key={e.id} className="flex justify-between items-center border rounded px-3 py-2">
              <div>
                <span className="font-medium">{e.title}</span>
                {e.is_running && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1 rounded">Running</span>}
                <div className="text-sm text-gray-500">
                  {e.categories?.name && <span style={{ color: e.categories.color }}>{e.categories.name} · </span>}
                  {e.duration_minutes != null ? `${e.duration_minutes}m` : e.is_running ? 'In progress' : '—'}
                  {e.start_time && ` · ${new Date(e.start_time).toLocaleDateString()}`}
                </div>
              </div>
              <button onClick={() => handleDelete(e.id)} className="text-red-500 text-sm ml-4">Delete</button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-3">Categories</h2>
        <form onSubmit={addCategory} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Category name"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer border" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </form>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">No categories yet.</p>
        ) : (
          <ul className="space-y-1">
            {categories.map(c => (
              <li key={c.id} className="flex justify-between items-center py-1">
                <span className="flex items-center gap-2">
                  <span style={{ backgroundColor: c.color }} className="w-3 h-3 rounded-full inline-block" />
                  {c.name}
                </span>
                <button onClick={() => deleteCategory(c.id)} className="text-red-500 text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
