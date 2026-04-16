import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import ExpenseCard from '../components/ExpenseCard'
import supabase from '../lib/supabase'

export default function DashboardPage() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [expRes, catRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false })
          .limit(5),
        supabase.from('categories').select('*'),
      ])

      if (expRes.error) {
        setError('Failed to load expenses.')
      } else {
        setExpenses(expRes.data)
      }
      if (!catRes.error) {
        setCategories(catRes.data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  const handleDelete = async (id) => {
    const { error: err } = await supabase.from('expenses').delete().eq('id', id)
    if (err) {
      setError('Failed to delete expense.')
      return
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  // Stats derived from fetched (recent 5) — full stats would need a separate query
  const totalSpend = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  // Category breakdown from recent expenses
  const categoryTotals = expenses.reduce((acc, e) => {
    const key = e.category_id ?? '__none'
    acc[key] = (acc[key] ?? 0) + Number(e.amount)
    return acc
  }, {})

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  const topCategoryName = topCategory
    ? categoryMap[topCategory[0]]?.name ?? 'Uncategorized'
    : '—'

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border rounded-lg p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-emerald-600">${totalSpend.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Recent Spend (5)</p>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-blue-600">{expenses.length}</p>
            <p className="text-xs text-gray-500 mt-1">Recent Expenses</p>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm text-center col-span-2 sm:col-span-1">
            <p className="text-lg font-bold text-purple-600 truncate">{topCategoryName}</p>
            <p className="text-xs text-gray-500 mt-1">Top Category</p>
          </div>
        </div>

        {/* Recent expenses */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Recent Expenses</h2>
          <Link to="/expenses" className="text-sm text-emerald-600 hover:underline">
            View all →
          </Link>
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
        ) : expenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No expenses yet.{' '}
            <Link to="/expenses" className="text-emerald-600 hover:underline">
              Add one
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
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
