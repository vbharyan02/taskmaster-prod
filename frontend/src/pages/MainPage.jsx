import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

const STATUS_OPTIONS = ['want_to_read', 'reading', 'finished']

export default function MainPage() {
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formTitle, setFormTitle] = useState('')
  const [formAuthor, setFormAuthor] = useState('')
  const [formGenre, setFormGenre] = useState('')
  const [formStatus, setFormStatus] = useState('want_to_read')
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchBooks() }, [])

  async function fetchBooks() {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        if (
          error.message.includes('does not exist') ||
          error.message.includes('schema cache') ||
          error.message.includes('relation') ||
          error.message.includes('Could not find')
        ) {
          setError('Something went wrong. Please try again later.')
        } else {
          setError(error.message)
        }
        return
      }
      setBooks(data)
    } catch (err) {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError(null)
    if (!formTitle.trim()) { setFormError('Title is required'); return }
    if (!formAuthor.trim()) { setFormError('Author is required'); return }
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: formTitle.trim(),
          author: formAuthor.trim(),
          genre: formGenre.trim() || null,
          status: formStatus || 'want_to_read',
          user_id: user.id,
        })
        .select()
        .single()
      if (error) { setFormError(error.message); return }
      setBooks(prev => [data, ...prev])
      setFormTitle('')
      setFormAuthor('')
      setFormGenre('')
      setFormStatus('want_to_read')
    } catch (err) {
      setFormError('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setBooks(prev => prev.filter(b => b.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Books</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 mb-8 p-4 border rounded">
        <h2 className="font-semibold">Add a Book</h2>
        <input
          type="text"
          placeholder="Title *"
          value={formTitle}
          onChange={e => setFormTitle(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          placeholder="Author *"
          value={formAuthor}
          onChange={e => setFormAuthor(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          placeholder="Genre (optional)"
          value={formGenre}
          onChange={e => setFormGenre(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <select
          value={formStatus}
          onChange={e => setFormStatus(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="want_to_read">Want to Read</option>
          <option value="reading">Reading</option>
          <option value="finished">Finished</option>
        </select>
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add Book'}
        </button>
      </form>

      {books.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No books yet. Add your first one above.
        </div>
      ) : (
        <ul className="space-y-3">
          {books.map(book => (
            <li key={book.id} className="flex justify-between items-start border rounded px-4 py-3">
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-gray-600">{book.author}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {book.genre && <span>{book.genre} · </span>}
                  <span className="capitalize">{book.status.replace(/_/g, ' ')}</span>
                </p>
              </div>
              <button
                onClick={() => handleDelete(book.id)}
                className="text-red-500 text-sm ml-4 shrink-0"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
