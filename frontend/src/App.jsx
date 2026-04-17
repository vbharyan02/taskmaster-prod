import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import supabase from './lib/supabase'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TasksListPage from './pages/TasksListPage'
import TaskDetailPage from './pages/TaskDetailPage'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={session ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/" element={session ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={session ? <TasksListPage /> : <Navigate to="/login" />} />
        <Route path="/tasks/:id" element={session ? <TaskDetailPage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
