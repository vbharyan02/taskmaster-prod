import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import supabase from '../lib/supabase'

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [activeEntryId, setActiveEntryId] = useState(null)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [id])
  useEffect(() => () => clearInterval(timerRef.current), [])

  async function fetchData() {
    setIsLoading(true)
    setError(null)
    try {
      const { data: taskData, error: taskErr } = await supabase
        .from('tasks').select('*').eq('id', id).single()
      if (taskErr) {
        setError(taskErr.message.includes('does not exist') || taskErr.message.includes('schema cache')
          ? 'Database not set up yet. Please run schema.sql in Supabase.'
          : taskErr.message)
        return
      }
      setTask(taskData)

      const { data: entryData, error: entryErr } = await supabase
        .from('time_entries').select('*').eq('task_id', id)
        .order('created_at', { ascending: false })
      if (entryErr) { setError(entryErr.message); return }
      setEntries(entryData || [])

      const active = (entryData || []).find(e => !e.stopped_at)
      if (active) {
        setRunning(true)
        setActiveEntryId(active.id)
        startTimeRef.current = new Date(active.started_at)
        timerRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }, 1000)
      }
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStart() {
    const { data: { user } } = await supabase.auth.getUser()
    const now = new Date().toISOString()
    const { data, error } = await supabase.from('time_entries')
      .insert({ task_id: id, user_id: user.id, started_at: now })
      .select().single()
    if (error) { setError(error.message); return }
    setRunning(true)
    setActiveEntryId(data.id)
    setElapsed(0)
    startTimeRef.current = new Date(now)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    setEntries([data, ...entries])
  }

  async function handleStop() {
    clearInterval(timerRef.current)
    const stoppedAt = new Date().toISOString()
    const duration = Math.floor((new Date(stoppedAt) - startTimeRef.current) / 1000)
    const { data, error } = await supabase.from('time_entries')
      .update({ stopped_at: stoppedAt, duration_seconds: duration })
      .eq('id', activeEntryId)
      .select().single()
    if (error) { setError(error.message); return }
    setRunning(false)
    setActiveEntryId(null)
    setElapsed(0)
    setEntries(entries.map(e => e.id === activeEntryId ? data : e))
  }

  async function handleDeleteEntry(entryId) {
    const { error } = await supabase.from('time_entries').delete().eq('id', entryId)
    if (error) { setError(error.message); return }
    setEntries(entries.filter(e => e.id !== entryId))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/tasks" className="text-blue-600 underline text-sm">← Tasks</Link>
          <h1 className="text-2xl font-bold mt-1">{task?.name}</h1>
          {task?.description && <p className="text-gray-500 text-sm mt-1">{task.description}</p>}
        </div>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>

      <div className="border rounded p-6 mb-8 text-center">
        {running ? (
          <>
            <p className="text-3xl font-mono mb-4">{formatDuration(elapsed)}</p>
            <button onClick={handleStop} className="bg-red-500 text-white px-6 py-2 rounded">Stop Timer</button>
          </>
        ) : (
          <button onClick={handleStart} className="bg-blue-600 text-white px-6 py-2 rounded">Start Timer</button>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">Time Entries</h2>
      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No time entries yet. Start tracking above.</div>
      ) : (
        <ul className="space-y-2">
          {entries.map(entry => (
            <li key={entry.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-sm text-gray-500">{new Date(entry.started_at).toLocaleString()}</p>
                <p className="text-sm font-mono">
                  {entry.stopped_at
                    ? formatDuration(entry.duration_seconds)
                    : <span className="text-blue-600">Running...</span>}
                </p>
              </div>
              {entry.stopped_at && (
                <button onClick={() => handleDeleteEntry(entry.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
