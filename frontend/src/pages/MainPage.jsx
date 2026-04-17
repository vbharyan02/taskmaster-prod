import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

const STATUS_OPTIONS = ['todo', 'in_progress', 'done']

export default function MainPage() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('todo')
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('tasks')
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
      setTasks(data || [])
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) { setFormError('Title is required'); return }
    setFormError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('tasks')
        .insert({ title: title.trim(), description: description.trim() || null, status: status || 'todo', user_id: user.id })
        .select()
        .single()
      if (error) { setFormError(error.message); return }
      setTasks([data, ...tasks])
      setTitle('')
      setDescription('')
      setStatus('todo')
    } catch {
      setFormError('Connection error. Please try again.')
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setTasks(tasks.filter(t => t.id !== id))
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
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 mb-8">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
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
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Add Task
        </button>
      </form>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tasks yet. Create your first one above.
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex justify-between items-start border rounded px-3 py-2">
              <div>
                <p className="font-medium">{task.title}</p>
                {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => handleDelete(task.id)}
                className="text-red-500 text-sm ml-4 flex-shrink-0"
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
