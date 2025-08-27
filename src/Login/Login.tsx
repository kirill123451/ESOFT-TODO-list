import { useState } from "react"
import './Login.css'

export default function Login() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [error, setError] = useState('')
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [patronymic, setPatronymic] = useState('')
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [leader, setLeader] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            let url, body

            if (mode === 'login') {
                url = 'https://esoft-todo-list-production.up.railway.app/api/auth/login'
                body = JSON.stringify({ login, password })
            } else {
                url = 'https://esoft-todo-list-production.up.railway.app/api/users'
                body = JSON.stringify({ 
                    name, surname, patronymic, login, password, 
                    leader_id: leader ? parseInt(leader) : null 
                })
            }

            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: body
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка сервера')
            }

            const data = await response.json()
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
            }
            window.location.href = '/tasks'

        } catch (err: any) {
            setError(err.message || 'Произошла ошибка')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">
                    {mode === 'login' ? 'Вход' : 'Регистрация'}
                </h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {mode === 'register' && (
                        <div className="register-section">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Имя</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        placeholder="Введите имя"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Фамилия</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        placeholder="Введите фамилию"
                                        value={surname}
                                        onChange={e => setSurname(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Отчество</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="Введите отчество"
                                    value={patronymic}
                                    onChange={e => setPatronymic(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Руководитель (ID)</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    placeholder="ID руководителя"
                                    value={leader}
                                    onChange={e => setLeader(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Логин</label>
                        <input 
                            type="text"
                            className="form-input"
                            placeholder="Введите логин"
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Пароль</label>
                        <input 
                            type="password"
                            className="form-input"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="form-buttons">
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                        </button>
                    </div>
                    
                    <div className="form-links">
                        <button 
                            type="button"
                            className="form-link-btn"
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            disabled={isLoading}
                        >
                            {mode === 'login' ? 'Зарегистрироваться' : 'Вернуться ко входу'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}