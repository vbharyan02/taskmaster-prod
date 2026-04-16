import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import TodoForm from '../components/TodoForm'
import supabase from '../lib/supabase'

const PRIORITY_STYLES = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export default function TodoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [todo, setTodo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTodo = async () => {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('todos')
        .select('*')
        .eq('id', id)
        .single()

      if (err) {
        setError('Todo not found.')
      } else {
        setTodo(data)
      }
      setLoading(false)
    }

    fetchTodo()
  }, [id])

  const handleUpdate = async (fields) => {
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('todos')
      .update({ ...fields })
      .eq('id', id)
      .select()
      .single()

    setSaving(false)
    if (err) {
      setError('Failed to update todo.')
      return
    }
    setTodo(data)
    setEditing(false)
  }

  const handleToggle = async () => {
    const { data, error: err } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id)
      .select()
      .single()

    if (err) {
      setError('Failed to update status.')
      return
    }
    setTodo(data)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this todo?')) return
    setDeleting(true)
    const { error: err } = await supabase.from('todos').delete().eq('id', id)
    setDeleting(false)

    if (err) {
      setError('Failed to delete todo.')
      return
    }
    navigate('/todos')
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link to="/todos" className="text-sm text-indigo-600 hover:underline">
            ← Back to Todos
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : error && !todo ? (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        ) : todo ? (
          <div className="bg-white border rounded-xl shadow-sm p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}

            {editing ? (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Edit Todo</h2>
                <TodoForm
                  initial={todo}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditing(false)}
                  loading={saving}
                />
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={handleToggle}
                      className="h-5 w-5 accent-indigo-600 cursor-pointer flex-shrink-0 mt-0.5"
                    />
                    <h1
                      className={`text-xl font-bold ${
                        todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      {todo.title}
                    </h1>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                      PRIORITY_STYLES[todo.priority] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {todo.priority}
                  </span>
                </div>

                {todo.notes && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4">{todo.notes}</p>
                )}

                <p className="text-xs text-gray-400 mb-6">
                  Created {new Date(todo.created_at).toLocaleString()}
                  {todo.updated_at !== todo.created_at && (
                    <> · Updated {new Date(todo.updated_at).toLocaleString()}</>
                  )}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
