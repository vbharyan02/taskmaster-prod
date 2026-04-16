import { useEffect, useState } from 'react'
import supabase from '../lib/supabase'

export default function ExpenseForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState(initial.title ?? '')
  const [amount, setAmount] = useState(initial.amount ?? '')
  const [categoryId, setCategoryId] = useState(initial.category_id ?? '')
  const [date, setDate] = useState(initial.date ?? new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, color')
        .order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Title is required.'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      errs.amount = 'Enter a valid positive amount.'
    if (!date) errs.date = 'Date is required.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    onSubmit({
      title: title.trim(),
      amount: parseFloat(Number(amount).toFixed(2)),
      category_id: categoryId || null,
      date,
      notes: notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors.title ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="e.g. Grocery run"
          disabled={loading}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount ($) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors.amount ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="0.00"
          disabled={loading}
        />
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors.date ? 'border-red-400' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={loading}
        >
          <option value="">— No category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Optional details..."
          disabled={loading}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : initial.id ? 'Update Expense' : 'Add Expense'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
