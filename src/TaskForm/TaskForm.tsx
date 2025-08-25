import { useState, type ChangeEvent } from "react"
import './TaskForm.css'

export default function TaskForm () {
    const [title, setTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [updateDate, setUpdateDate] = useState<string>('')
    const [priority, setPriority] = useState<string>('')
    const [status, setStatus] = useState<string>('')
    const [responsible, setResponsible] = useState<string>('')

    function Writer(e: ChangeEvent<HTMLFormElement>) {
        e.preventDefault()
        console.log(title, description, startDate, endDate, updateDate, priority, status, responsible)
    }
    
    return (
        <div className="task-form-container">
            <h2 className="form-title">Новая задача</h2>

            <form onSubmit={Writer} className="task-form">
                <div className="form-group">
                    <label className="form-label">Заголовок *</label>
                    <input 
                        type="text"
                        className="form-input"
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Описание</label>
                    <textarea
                        className="form-textarea"
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Дата создания</label>
                        <input
                            type="date"
                            className="form-input"
                            onChange={e => setStartDate(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Дата окончания *</label>
                        <input
                            type="date"
                            className="form-input"
                            onChange={e => setEndDate(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Дата обновления</label>
                        <input
                            type="date"
                            className="form-input"
                            onChange={e => setUpdateDate(e.target.value)}
                            required 
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Приоритет *</label>
                        <select
                            className="form-select"
                            onChange={e => setPriority(e.target.value)}
                            required
                        >
                            <option value="">Выберите приоритет</option>
                            <option value="low">Низкий</option>
                            <option value="medium">Средний</option>
                            <option value="high">Высокий</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Статус *</label>
                        <select
                            className="form-select"
                            onChange={e => setStatus(e.target.value)}
                            required
                        >
                            <option value="">Выберите статус</option>
                            <option value="to_do">К выполнению</option>
                            <option value="in_progress">Выполняется</option>
                            <option value="done">Выполнена</option>
                            <option value="cancelled">Отменена</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Ответственный *</label>
                        <select
                            className="form-select"
                            onChange={e => setResponsible(e.target.value)}
                            required
                        >
                            <option value="">Выберите ответственного</option>
                            <option value="user1">Иван Иванов</option>
                            <option value="user2">Петр Петров</option>
                            <option value="user3">Сергей Сергеев</option>
                            <option value="user4">Анна Андреева</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Создатель</label>
                        <input 
                            className="form-input readonly"
                            defaultValue="Текущий пользователь"
                            readOnly
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