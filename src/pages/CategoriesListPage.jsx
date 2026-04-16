import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import CategoryCard from '../components/CategoryCard'
import CategoryForm from '../components/CategoryForm'
import supabase from '../lib/supabase'

export default function CategoriesListPage() {
  const [categories, setCategories] = useState([])
  const [expenseCounts, setExpenseCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // category being edited

  const fetchData = async () => {
    setLoading(true)
    setError('')
    const [catRes, expRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('expenses').select('category_id'),
    ])

    if (catRes.error) {
      setError('Failed to load categories.')
    } else {
      setCategories(catRes.data)
    }

    if (!expRes.error && expRes.data) {
      const counts = expRes.data.reduce((acc, e) => {
        if (e.category_id) acc[e.category_id] = (acc[e.category_id] ?? 0) + 1
        return acc
      }, {})
      setExpenseCounts(counts)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (fields) => {
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('categories')
      .insert({ ...fields })
      .select()
      .single()

    setSaving(false)
    if (err) {
      setError('Failed to create category.')
      return
    }
    setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setShowForm(false)
  }

  const handleUpdate = async (fields) => {
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('categories')
      .update({ ...fields })
      .eq('id', editing.id)
      .select()
      .single()

    setSaving(false)
    if (err) {
      setError('Failed to update category.')
      return
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === editing.id ? data : c)).sort((a, b) => a.name.localeCompare(b.name))
    )
    setEditing(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Expenses will become uncategorized.')) return
    const { error: err } = await supabase.from('categories').delete().eq('id', id)
    if (err) {
      setError('Failed to delete category.')
      return
    }
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          {!editing && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
            >
              {showForm ? 'Cancel' : '+ New Category'}
            </button>
          )}
        </div>

        {showForm && !editing && (
          <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">New Category</h2>
            <CategoryForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={saving}
            />
          </div>
        )}

        {editing && (
          <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Edit Category</h2>
            <CategoryForm
              initial={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              loading={saving}
            />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No categories yet. Create one above.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                expenseCount={expenseCounts[category.id] ?? 0}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
