import { Link } from 'react-router-dom'

export default function ExpenseCard({ expense, categoryMap, onDelete }) {
  const category = categoryMap?.[expense.category_id]

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm flex items-start gap-4">
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
        style={{ backgroundColor: category?.color ?? '#9ca3af' }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/expenses/${expense.id}`}
            className="text-sm font-medium text-gray-800 hover:text-emerald-600 truncate"
          >
            {expense.title}
          </Link>
          {category && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{
                backgroundColor: category.color + '22',
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          {new Date(expense.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        {expense.notes && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{expense.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800">
          ${Number(expense.amount).toFixed(2)}
        </span>
        <button
          onClick={() => onDelete(expense.id)}
          className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
          aria-label="Delete expense"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
