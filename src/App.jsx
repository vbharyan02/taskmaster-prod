import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import supabase from './lib/supabase'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExpensesListPage from './pages/ExpensesListPage'
import ExpenseDetailPage from './pages/ExpenseDetailPage'
import CategoriesListPage from './pages/CategoriesListPage'

export default function App() {
  const { initialize, setSession } = useAuthStore()

  useEffect(() => {
    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/:id"
          element={
            <ProtectedRoute>
              <ExpenseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesListPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
