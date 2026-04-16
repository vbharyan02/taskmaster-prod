export default function CategoryCard({ category, expenseCount, onEdit, onDelete }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: category.color }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{category.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
        </p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-300 rounded-md hover:bg-emerald-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
