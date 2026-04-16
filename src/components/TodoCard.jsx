import { Link } from 'react-router-dom'

const PRIORITY_STYLES = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export default function TodoCard({ todo, onToggle, onDelete }) {
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm flex items-start gap-3 transition-opacity ${todo.completed ? 'opacity-60' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        className="mt-1 h-4 w-4 accent-indigo-600 cursor-pointer flex-shrink-0"
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/todos/${todo.id}`}
            className={`text-sm font-medium hover:text-indigo-600 truncate ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
          >
            {todo.title}
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${PRIORITY_STYLES[todo.priority] ?? 'bg-gray-100 text-gray-600'}`}>
            {todo.priority}
          </span>
        </div>
        {todo.notes && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{todo.notes}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {new Date(todo.created_at).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
        aria-label="Delete todo"
      >
        &times;
      </button>
    </div>
  )
}
