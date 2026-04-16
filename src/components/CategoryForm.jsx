import { useState } from 'react'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

export default function CategoryForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial.name ?? '')
  const [color, setColor] = useState(initial.color ?? PRESET_COLORS[0])
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Name is required.'
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
    onSubmit({ name: name.trim(), color })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors.name ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="e.g. Groceries"
          disabled={loading}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c ? 'border-gray-700 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
              disabled={loading}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-gray-300"
            title="Custom color"
            disabled={loading}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs text-gray-500">{color}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : initial.id ? 'Update Category' : 'Create Category'}
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
