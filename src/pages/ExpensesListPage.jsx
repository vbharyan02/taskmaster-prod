import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import ExpenseCard from '../components/ExpenseCard'
import ExpenseForm from '../components/ExpenseForm'
import supabase from '../lib/supabase'

export default function ExpensesListPage() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    const [expRes, catRes] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])

    if (expRes.error) {
      setError('Failed to load expenses.')
    } else {
      setExpenses(expRes.data)
    }
    if (!catRes.error) setCategories(catRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  const handleCreate = async (fields) => {
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('expenses')
      .insert({ ...fields })
      .select()
      .single()

    setSaving(false)
    if (err) {
      setError('Failed to add expense.')
      return
    }
    setExpenses((prev) => [data, ...prev])
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    const { error: err } = await supabase.from('expenses').delete().eq('id', id)
    if (err) {
      setError('Failed to delete expense.')
      return
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const visible =
    categoryFilter === 'all'
      ? expenses
      : categoryFilter === '__none'
      ? expenses.filter((e) => !e.category_id)
      : expenses.filter((e) => e.category_id === categoryFilter)

  const totalVisible = visible.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">New Expense</h2>
            <ExpenseForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={saving}
            />
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="all">All</option>
              <option value="__none">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-400 self-center">
            {visible.length} expense{visible.length !== 1 ? 's' : ''} · ${totalVisible.toFixed(2)}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {expenses.length === 0
              ? 'No expenses yet. Add one above.'
              : 'No expenses match your filter.'}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                categoryMap={categoryMap}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
