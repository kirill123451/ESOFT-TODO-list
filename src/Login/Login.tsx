import { useState } from "react"
import './Login.css'

export default function Login () {
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
    const [error, setError] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [surname, setSurname] = useState<string>('')
    const [patronymic, setPatronymic] = useState<string>('')
    const [login, setLogin] = useState<string>('')
    const [password, setPassword] = useState<number>()
    const [leader, setLeader] = useState<string>('')

    function submiter() {
        console.log(1)
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">
                    {mode === 'login' && 'Вход'}
                    {mode === 'register' && 'Регистрация'}
                    {mode === 'forgot' && 'Восстановление пароля'}
                </h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={submiter} className="login-form">
                    {mode === 'register' && (
                        <div className="register-section">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Имя</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        placeholder="Введите имя"
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Фамилия</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        placeholder="Введите фамилию"
                                        onChange={e => setSurname(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Отчество</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="Введите отчество"
                                    onChange={e => setPatronymic(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Руководитель</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="Укажите вашего руководителя"
                                    onChange={e => setLeader(e.target.value)}
                                    required 
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
                            onChange={e => setLogin(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Пароль</label>
                        <input 
                            type="password"
                            className="form-input"
                            placeholder="Введите пароль"
                            onChange={e => setPassword(parseInt(e.target.value))}
                            required
                        />
                    </div>
                    
                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">
                            {mode === 'login' && 'Войти'}
                            {mode === 'register' && 'Зарегистрироваться'}
                        </button>
                    </div>
                    
                    <div className="form-links">
                        {mode === 'login' && (
                            <a href='#' onClick={e => {e.preventDefault(); setMode('register')}} className="form-link">
                                Зарегистрироваться
                            </a>
                        )}
                        {mode === 'register' && (
                            <a href="#" onClick={e => {e.preventDefault(); setMode('login')}} className="form-link">
                                Вернуться ко входу
                            </a>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}