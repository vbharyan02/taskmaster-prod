import { useState } from 'react'

const PRIORITIES = ['low', 'medium', 'high']

export default function TodoForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState(initial.title ?? '')
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [priority, setPriority] = useState(initial.priority ?? 'medium')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Title is required.'
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
    onSubmit({ title: title.trim(), notes: notes.trim(), priority })
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
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.title ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="What needs to be done?"
          disabled={loading}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Optional details..."
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : initial.id ? 'Update Todo' : 'Create Todo'}
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
