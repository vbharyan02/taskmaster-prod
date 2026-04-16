import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function MainPage() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTodos(data)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('todos')
      .insert({ title, description, due_date: dueDate || null, user_id: user.id, is_completed: false })
      .select()
      .single()
    if (error) {
      setError(error.message)
    } else {
      setTodos([data, ...todos])
      setTitle('')
      setDescription('')
      setDueDate('')
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) setError(error.message)
    else setTodos(todos.filter(t => t.id !== id))
  }

  async function handleToggle(todo) {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !todo.is_completed })
      .eq('id', todo.id)
    if (error) setError(error.message)
    else setTodos(todos.map(t => t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Todos</h1>
        <button onClick={handleLogout} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          Logout
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-2 mb-6">
        <input
          type="text"
          placeholder="Title"
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
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Todo
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-start justify-between border rounded px-3 py-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => handleToggle(todo)}
                className="mt-1"
              />
              <div>
                <p className={`font-medium ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                  {todo.title}
                </p>
                {todo.description && <p className="text-sm text-gray-500">{todo.description}</p>}
                {todo.due_date && (
                  <p className="text-xs text-gray-400">Due: {todo.due_date}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(todo.id)}
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
