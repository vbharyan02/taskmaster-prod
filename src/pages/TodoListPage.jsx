import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import TodoCard from '../components/TodoCard'
import TodoForm from '../components/TodoForm'
import supabase from '../lib/supabase'

const PRIORITIES = ['all', 'low', 'medium', 'high']
const STATUSES = ['all', 'pending', 'completed']

export default function TodoListPage() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchTodos = async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError('Failed to load todos.')
    } else {
      setTodos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const handleCreate = async (fields) => {
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('todos')
      .insert({ ...fields })
      .select()
      .single()

    setSaving(false)
    if (err) {
      setError('Failed to create todo.')
      return
    }
    setTodos((prev) => [data, ...prev])
    setShowForm(false)
  }

  const handleToggle = async (todo) => {
    const { error: err } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)

    if (err) {
      setError('Failed to update todo.')
      return
    }
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleDelete = async (id) => {
    const { error: err } = await supabase.from('todos').delete().eq('id', id)
    if (err) {
      setError('Failed to delete todo.')
      return
    }
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const visible = todos.filter((t) => {
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && t.completed) ||
      (statusFilter === 'pending' && !t.completed)
    return matchPriority && matchStatus
  })

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Todos</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Todo'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">New Todo</h2>
            <TodoForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={saving}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-400 self-center">
            {visible.length} of {todos.length}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {todos.length === 0 ? 'No todos yet. Create one above.' : 'No todos match your filters.'}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
