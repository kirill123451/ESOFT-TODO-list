import { useState, useEffect } from 'react'
import './TaskPage.css'

export default function TasksPage() {
    const [tasks, setTasks] = useState<any>({})
    const [grouping, setGrouping] = useState<string>('none')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchTasks()
    }, [grouping])

    const fetchTasks = async () => {
        try {
            setLoading(true)
            setError('')
            
            const url = grouping === 'none' 
                ? 'http://localhost:3000/api/tasks'
                : `http://localhost:3000/api/tasks?group=${grouping}`
            
            const response = await fetch(url, {
                credentials: 'include'
            })
            
            if (!response.ok) {
                if (response.status === 401) {
                    return
                }
                throw new Error('Ошибка загрузки задач')
            }
            
            const data = await response.json()
            setTasks(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getTaskColor = (task: any) => {
        const today = new Date()
        const endDate = new Date(task.end_date)
        
        if (task.status === 'done' || task.status === 'cancelled') return 'green'
        if (endDate < today) return 'red'
        return 'gray'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU')
    }

    const getStatusText = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'to_do': 'К выполнению',
            'in_progress': 'Выполняется',
            'done': 'Выполнена',
            'cancelled': 'Отменена'
        }
        return statusMap[status] || status
    }

    const getPriorityText = (priority: string) => {
        const priorityMap: { [key: string]: string } = {
            'low': 'Низкий',
            'medium': 'Средний',
            'high': 'Высокий'
        }
        return priorityMap[priority] || priority
    }

    if (loading) {
        return (
            <div className="tasks-loading">
                <div className="loading-spinner"></div>
                <p>Загрузка задач...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="tasks-error">
                <p>{error}</p>
                <button onClick={fetchTasks} className="retry-btn">
                    Повторить попытку
                </button>
            </div>
        )
    }

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <h2 className="tasks-title">Задачи</h2>
                
                <div className="tasks-controls">
                    <select 
                        value={grouping} 
                        onChange={(e) => setGrouping(e.target.value)}
                        className="group-select"
                    >
                        <option value="none">Все задачи</option>
                        <option value="date">По дате</option>
                        <option value="responsible">По ответственным</option>
                    </select>
                    
                    <button className="new-task-btn" onClick={() => window.location.href = '/task-form'}>
                        Новая задача
                    </button>
                </div>
            </div>

            {grouping === 'date' && (
                <div className="tasks-group">
                    <div className="date-group">
                        <h3 className="group-title">Сегодня</h3>
                        {tasks.today?.length === 0 ? (
                            <p className="no-tasks">Нет задач на сегодня</p>
                        ) : (
                            tasks.today?.map((task: any) => (
                                <div key={task.id} className="task-item" style={{color: getTaskColor(task)}}>
                                    <div className="task-main">
                                        <h4 className="task-title">{task.title}</h4>
                                        <span className={`task-priority ${task.priority}`}>
                                            {getPriorityText(task.priority)}
                                        </span>
                                    </div>
                                    <div className="task-details">
                                        <span>до {formatDate(task.end_date)}</span>
                                        <span>{task.responsible_name} {task.responsible_surname}</span>
                                        <span className="task-status">{getStatusText(task.status)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="date-group">
                        <h3 className="group-title">На неделю</h3>
                        {tasks.week?.length === 0 ? (
                            <p className="no-tasks">Нет задач на неделю</p>
                        ) : (
                            tasks.week?.map((task: any) => (
                                <div key={task.id} className="task-item" style={{color: getTaskColor(task)}}>
                                    <div className="task-main">
                                        <h4 className="task-title">{task.title}</h4>
                                        <span className={`task-priority ${task.priority}`}>
                                            {getPriorityText(task.priority)}
                                        </span>
                                    </div>
                                    <div className="task-details">
                                        <span>до {formatDate(task.end_date)}</span>
                                        <span>{task.responsible_name} {task.responsible_surname}</span>
                                        <span className="task-status">{getStatusText(task.status)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="date-group">
                        <h3 className="group-title">На будущее</h3>
                        {tasks.future?.length === 0 ? (
                            <p className="no-tasks">Нет задач на будущее</p>
                        ) : (
                            tasks.future?.map((task: any) => (
                                <div key={task.id} className="task-item" style={{color: getTaskColor(task)}}>
                                    <div className="task-main">
                                        <h4 className="task-title">{task.title}</h4>
                                        <span className={`task-priority ${task.priority}`}>
                                            {getPriorityText(task.priority)}
                                        </span>
                                    </div>
                                    <div className="task-details">
                                        <span>до {formatDate(task.end_date)}</span>
                                        <span>{task.responsible_name} {task.responsible_surname}</span>
                                        <span className="task-status">{getStatusText(task.status)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {grouping === 'responsible' && (
                <div className="tasks-group">
                    {Object.entries(tasks).map(([responsible, taskList]: [string, any]) => (
                        <div key={responsible} className="responsible-group">
                            <h3 className="group-title">{responsible}</h3>
                            {taskList.length === 0 ? (
                                <p className="no-tasks">Нет задач у этого сотрудника</p>
                            ) : (
                                taskList.map((task: any) => (
                                    <div key={task.id} className="task-item" style={{color: getTaskColor(task)}}>
                                        <div className="task-main">
                                            <h4 className="task-title">{task.title}</h4>
                                            <span className={`task-priority ${task.priority}`}>
                                                {getPriorityText(task.priority)}
                                            </span>
                                        </div>
                                        <div className="task-details">
                                            <span>до {formatDate(task.end_date)}</span>
                                            <span className="task-status">{getStatusText(task.status)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            )}

            {grouping === 'none' && (
                <div className="tasks-list">
                    {tasks.length === 0 ? (
                        <p className="no-tasks">Нет задач</p>
                    ) : (
                        tasks.map((task: any) => (
                            <div key={task.id} className="task-item" style={{color: getTaskColor(task)}}>
                                <div className="task-main">
                                    <h4 className="task-title">{task.title}</h4>
                                    <span className={`task-priority ${task.priority}`}>
                                        {getPriorityText(task.priority)}
                                    </span>
                                </div>
                                <div className="task-details">
                                    <span>до {formatDate(task.end_date)}</span>
                                    <span>{task.responsible_name} {task.responsible_surname}</span>
                                    <span className="task-status">{getStatusText(task.status)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}