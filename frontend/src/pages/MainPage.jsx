import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function MainPage() {
  const [workouts, setWorkouts] = useState([])
  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchWorkouts() }, [])

  async function fetchWorkouts() {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setWorkouts(data)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('workouts')
      .insert({ exercise_name: exerciseName, sets: Number(sets), reps: Number(reps), weight: Number(weight), date, user_id: user.id })
      .select()
      .single()
    if (error) {
      setError(error.message)
    } else {
      setExerciseName(''); setSets(''); setReps(''); setWeight('')
      setDate(new Date().toISOString().slice(0, 10))
      fetchWorkouts()
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) setError(error.message)
    else setWorkouts(w => w.filter(x => x.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 mb-8">
        <input
          type="text"
          placeholder="Exercise name"
          value={exerciseName}
          onChange={e => setExerciseName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <div className="flex gap-2">
          <input type="number" placeholder="Sets" value={sets} onChange={e => setSets(e.target.value)}
            className="border rounded px-3 py-2 w-full" required min="1" />
          <input type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)}
            className="border rounded px-3 py-2 w-full" required min="1" />
          <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)}
            className="border rounded px-3 py-2 w-full" min="0" step="0.5" />
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border rounded px-3 py-2 w-full" required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add Workout</button>
      </form>

      <ul className="space-y-2">
        {workouts.map(w => (
          <li key={w.id} className="flex justify-between items-center border rounded px-3 py-2">
            <div>
              <span className="font-medium">{w.exercise_name}</span>
              <span className="text-sm text-gray-500 ml-2">{w.sets}x{w.reps} @ {w.weight}kg — {w.date}</span>
            </div>
            <button onClick={() => handleDelete(w.id)} className="text-red-500 text-sm ml-4">Delete</button>
          </li>
        ))}
        {workouts.length === 0 && <p className="text-gray-400 text-sm">No workouts yet. Add one above.</p>}
      </ul>
    </div>
  )
}
