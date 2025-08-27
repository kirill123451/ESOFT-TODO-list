import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Header.css'

export default function Header() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
        
        const handleStorageChange = () => {
            const userData = localStorage.getItem('user')
            setUser(userData ? JSON.parse(userData) : null)
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    return (
        <header className="app-header">
            <div className="header-content">
                <h1>TODO List</h1>
                <nav className="header-nav">
                    <Link to='/tasks' className='nav-link'>Задачи</Link>
                    <Link to='/task-form' className='nav-link'>Новая задача</Link>
                    {user ? (
                        <Link to='/profile' className='nav-link'>
                            {user.name} {user.surname}
                        </Link>
                    ) : (
                        <Link to='/login' className='nav-link'>Войти</Link>
                    )}
                </nav>
            </div>
        </header>
    )
}