import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Header from './Header/Header'
import TaskForm from './TaskForm/TaskForm'
import Login from './Login/Login'
import Profile from './Profile/Profile'
import TasksPage from './TaskPage/TaskPage'
import ProtectedRoute from './ProtectedRoute/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/task-form" 
            element={
              <ProtectedRoute>
                <TaskForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App