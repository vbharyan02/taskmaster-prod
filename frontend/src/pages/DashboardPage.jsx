import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import supabase from '../lib/supabase'

function formatDuration(seconds) {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function DashboardPage() {
  const [entries, setEntries] = useState([])
  const [taskMap, setTaskMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setIsLoading(true)
    setError(null)
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data: taskData, error: taskErr } = await supabase.from('tasks').select('id, name')
      if (taskErr) {
        setError(taskErr.message.includes('does not exist') || taskErr.message.includes('schema cache')
          ? 'Database not set up yet. Please run schema.sql in Supabase.'
          : taskErr.message)
        return
      }
      const map = {}
      taskData.forEach(t => { map[t.id] = t.name })
      setTaskMap(map)

      const { data: entryData, error: entryErr } = await supabase
        .from('time_entries')
        .select('task_id, duration_seconds, started_at')
        .gte('started_at', weekAgo)
        .not('stopped_at', 'is', null)
      if (entryErr) { setError(entryErr.message); return }
      setEntries(entryData || [])
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function groupByTask(list) {
    const groups = {}
    list.forEach(e => {
      groups[e.task_id] = (groups[e.task_id] || 0) + (e.duration_seconds || 0)
    })
    return groups
  }

  const today = new Date().toDateString()
  const dailyEntries = entries.filter(e => new Date(e.started_at).toDateString() === today)
  const dailyGroups = groupByTask(dailyEntries)
  const weeklyGroups = groupByTask(entries)

  if (isLoading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="space-x-3">
          <Link to="/tasks" className="text-blue-600 underline text-sm">Tasks</Link>
          <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Today</h2>
        {Object.keys(dailyGroups).length === 0 ? (
          <p className="text-gray-500 text-sm">No time tracked today.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(dailyGroups).map(([taskId, secs]) => (
              <li key={taskId} className="flex justify-between border-b pb-2">
                <Link to={`/tasks/${taskId}`} className="text-blue-700 hover:underline">
                  {taskMap[taskId] || 'Unknown task'}
                </Link>
                <span className="font-mono text-gray-600">{formatDuration(secs)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Last 7 Days</h2>
        {Object.keys(weeklyGroups).length === 0 ? (
          <p className="text-gray-500 text-sm">No time tracked this week.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(weeklyGroups).map(([taskId, secs]) => (
              <li key={taskId} className="flex justify-between border-b pb-2">
                <Link to={`/tasks/${taskId}`} className="text-blue-700 hover:underline">
                  {taskMap[taskId] || 'Unknown task'}
                </Link>
                <span className="font-mono text-gray-600">{formatDuration(secs)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
