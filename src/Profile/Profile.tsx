import { useState, useEffect } from 'react'
import './Profile.css'

export default function Profile() {
    const [user, setUser] = useState<any>(null)
    const [leaderName, setLeaderName] = useState<string>('')
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            
            if (parsedUser.leader_id) {
                fetchLeaderName(parsedUser.leader_id)
            }
        }
    }, [])

    const fetchLeaderName = async (leaderId: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${leaderId}`, {
                credentials: 'include'
            })
            
            if (response.ok) {
                const leaderData = await response.json()
                setLeaderName(`${leaderData.surname} ${leaderData.name} ${leaderData.patronymic || ''}`.trim())
            }
        } catch (error) {
            console.error('Ошибка загрузки данных руководителя:', error)
        }
    }

    const handleLogout = async () => {
        if (isLoggingOut) return
        
        setIsLoggingOut(true)
        try {
            fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            }).catch(() => {
            })
            
            localStorage.removeItem('user')
            window.location.href = '/login'
            
        } catch (error) {
            console.error('Ошибка выхода:', error)
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
    }

    if (!user) {
        return (
            <div className="profile-container">
                <div className="profile-card">
                    <p>Загрузка данных пользователя...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2 className="profile-title">Личный кабинет</h2>
                
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        {user.name[0]}{user.surname[0]}
                    </div>
                    <h3>{user.surname} {user.name} {user.patronymic || ''}</h3>
                    <p>Сотрудник</p>
                </div>

                <div className="profile-info">
                    <div className="info-item">
                        <span className="info-label">Логин:</span>
                        <span className="info-value">{user.login}</span>
                    </div>
                    
                    {user.leader_id && (
                        <div className="info-item">
                            <span className="info-label">Руководитель:</span>
                            <span className="info-value">
                                {leaderName || `ID: ${user.leader_id}`}
                            </span>
                        </div>
                    )}
                    
                    <div className="info-item">
                        <span className="info-label">ID:</span>
                        <span className="info-value">{user.id}</span>
                    </div>
                </div>

                <button 
                    className="logout-btn" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? 'Выход...' : 'Выйти из аккаунта'}
                </button>
            </div>
        </div>
    )
}