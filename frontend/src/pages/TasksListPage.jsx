import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import supabase from '../lib/supabase'
import useAuthStore from '../store/authStore'

export default function TasksListPage() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => { if (user) fetchTasks() }, [user])

  async function fetchTasks() {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (error) {
        setError(error.message.includes('does not exist') || error.message.includes('schema cache')
          ? 'Something went wrong. Please try again later.'
          : error.message)
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
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('tasks')
      .insert({ name, description, user_id: user.id })
      .select().single()
    if (error) { setError(error.message); return }
    setTasks([data, ...tasks])
    setName('')
    setDescription('')
  }

  async function handleEdit(e) {
    e.preventDefault()
    const { data, error } = await supabase.from('tasks')
      .update({ name: editName, description: editDescription })
      .eq('id', editId)
      .select().single()
    if (error) { setError(error.message); return }
    setTasks(tasks.map(t => t.id === editId ? data : t))
    setEditId(null)
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

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="space-x-3">
          <Link to="/" className="text-blue-600 underline text-sm">Dashboard</Link>
          <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-2 mb-8">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Task name"
          className="border rounded px-3 py-2 w-full" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)"
          className="border rounded px-3 py-2 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No tasks yet. Create your first one above.</div>
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <li key={task.id} className="border rounded p-3">
              {editId === task.id ? (
                <form onSubmit={handleEdit} className="space-y-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="border rounded px-3 py-2 w-full" required />
                  <input value={editDescription} onChange={e => setEditDescription(e.target.value)}
                    className="border rounded px-3 py-2 w-full" />
                  <div className="space-x-2">
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
                    <button type="button" onClick={() => setEditId(null)} className="bg-gray-200 px-3 py-1 rounded text-sm">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/tasks/${task.id}`} className="font-semibold text-blue-700 hover:underline">{task.name}</Link>
                    {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                  </div>
                  <div className="space-x-2 flex-shrink-0 ml-4">
                    <button onClick={() => { setEditId(task.id); setEditName(task.name); setEditDescription(task.description || '') }}
                      className="bg-gray-200 px-3 py-1 rounded text-sm">Edit</button>
                    <button onClick={() => handleDelete(task.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
