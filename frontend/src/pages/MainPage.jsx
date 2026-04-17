import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function MainPage() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTasks(data)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, description, priority, due_date: dueDate || null, status: 'open', completed: false, user_id: user.id })
      .select()
      .single()
    if (error) { setError(error.message); return }
    setTasks([data, ...tasks])
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) setError(error.message)
    else setTasks(tasks.filter(t => t.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <button onClick={handleLogout} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          Logout
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-2 mb-6">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Task
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {tasks.map(task => (
          <li key={task.id} className="flex items-start justify-between border rounded px-3 py-2">
            <div>
              <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </p>
              {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
              <p className="text-xs text-gray-400">
                Priority: {task.priority}{task.due_date ? ` · Due: ${task.due_date}` : ''}
              </p>
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              className="text-red-500 text-sm ml-2 shrink-0"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
