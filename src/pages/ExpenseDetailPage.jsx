import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import ExpenseForm from '../components/ExpenseForm'
import supabase from '../lib/supabase'

export default function ExpenseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [expense, setExpense] = useState(null)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchExpense = async () => {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single()

      if (err) {
        setError('Expense not found.')
      } else {
        setExpense(data)
        if (data.category_id) {
          const { data: cat } = await supabase
            .from('categories')
            .select('*')
            .eq('id', data.category_id)
            .single()
          setCategory(cat)
        }
      }
      setLoading(false)
    }
    fetchExpense()
  }, [id])

  const handleUpdate = async (fields) => {
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('expenses')
      .update({ ...fields })
      .eq('id', id)
      .select()
      .single()

    setSaving(false)
    if (err) {
      setError('Failed to update expense.')
      return
    }
    setExpense(data)
    // refresh category if changed
    if (data.category_id !== expense.category_id) {
      if (data.category_id) {
        const { data: cat } = await supabase
          .from('categories')
          .select('*')
          .eq('id', data.category_id)
          .single()
        setCategory(cat)
      } else {
        setCategory(null)
      }
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this expense?')) return
    setDeleting(true)
    const { error: err } = await supabase.from('expenses').delete().eq('id', id)
    setDeleting(false)

    if (err) {
      setError('Failed to delete expense.')
      return
    }
    navigate('/expenses')
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link to="/expenses" className="text-sm text-emerald-600 hover:underline">
            ← Back to Expenses
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : error && !expense ? (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        ) : expense ? (
          <div className="bg-white border rounded-xl shadow-sm p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}

            {editing ? (
              <>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Edit Expense</h2>
                <ExpenseForm
                  initial={expense}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditing(false)}
                  loading={saving}
                />
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-xl font-bold text-gray-800">{expense.title}</h1>
                  <span className="text-2xl font-bold text-emerald-600 flex-shrink-0">
                    ${Number(expense.amount).toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium w-20 text-gray-400">Date</span>
                    {new Date(expense.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium w-20 text-gray-400">Category</span>
                    {category ? (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: category.color + '22',
                          color: category.color,
                        }}
                      >
                        {category.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Uncategorized</span>
                    )}
                  </div>

                  {expense.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-400 block mb-1">Notes</span>
                      <p className="whitespace-pre-wrap">{expense.notes}</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-6">
                  Created {new Date(expense.created_at).toLocaleString()}
                  {expense.updated_at !== expense.created_at && (
                    <> · Updated {new Date(expense.updated_at).toLocaleString()}</>
                  )}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
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
