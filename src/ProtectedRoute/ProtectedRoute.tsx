import { useEffect, useState, type JSX } from 'react'
import { Navigate } from 'react-router-dom'
import './ProtectedRoute.css'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await fetch('https://esoft-todo-list-production.up.railway.app/api/auth/check', {
                credentials: 'include'
            })
            
            if (response.ok) {
                const data = await response.json()
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user))
                }
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
            }
        } catch (error) {
            setIsAuthenticated(false)
        }
    }

    if (isAuthenticated === null) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Проверка авторизации...</p>
            </div>
        )
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />
}