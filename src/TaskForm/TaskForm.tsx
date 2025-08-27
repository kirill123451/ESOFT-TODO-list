import { useState } from "react"
import './TaskForm.css'

export default function TaskForm() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [endDate, setEndDate] = useState('')
    const [priority, setPriority] = useState('')
    const [status, setStatus] = useState('to_do')
    const [responsible, setResponsible] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    end_date: endDate,
                    priority,
                    status,
                    responsible_id: parseInt(responsible)
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка создания задачи')
            }

            const data = await response.json()
            console.log('Задача создана:', data)
            
            setTitle('')
            setDescription('')
            setEndDate('')
            setPriority('')
            setStatus('to_do')
            setResponsible('')
            
            alert('Задача успешно создана!')

        } catch (err: any) {
            setError(err.message || 'Ошибка при создании задачи')
        }
    }

    return (
        <div className="task-form-container">
            <h2 className="form-title">Новая задача</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                    <label className="form-label">Заголовок *</label>
                    <input 
                        type="text"
                        className="form-input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Описание</label>
                    <textarea
                        className="form-textarea"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Дата окончания *</label>
                        <input
                            type="date"
                            className="form-input"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Приоритет *</label>
                        <select
                            className="form-select"
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                            required
                        >
                            <option value="">Выберите приоритет</option>
                            <option value="low">Низкий</option>
                            <option value="medium">Средний</option>
                            <option value="high">Высокий</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Статус</label>
                        <select
                            className="form-select"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="to_do">К выполнению</option>
                            <option value="in_progress">Выполняется</option>
                            <option value="done">Выполнена</option>
                            <option value="cancelled">Отменена</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ответственный (ID) *</label>
                        <input
                            type="number"
                            className="form-input"
                            value={responsible}
                            onChange={e => setResponsible(e.target.value)}
                            placeholder="ID пользователя"
                            required
                        />
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                        Сохранить задачу
                    </button>
                </div>
            </form>
        </div>
    )
}