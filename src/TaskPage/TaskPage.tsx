import { useState, useEffect } from 'react'
import './TaskPage.css'
import TaskModal from '../TaskModal/TaskModal'

interface Task {
  id: number
  title: string
  description?: string
  end_date: string
  created_at?: string
  updated_at?: string
  priority: 'low' | 'medium' | 'high'
  status: 'to_do' | 'in_progress' | 'done' | 'cancelled'
  creator_id: number
  responsible_id: number
  creator_name?: string
  creator_surname?: string
  responsible_name?: string
  responsible_surname?: string
}

interface GroupedTasks {
  today: Task[]
  week: Task[]
  future: Task[]
}

interface ResponsibleGroupedTasks {
  [key: string]: Task[]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[] | GroupedTasks | ResponsibleGroupedTasks | null>(null)
  const [grouping, setGrouping] = useState<string>('none')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [subordinates, setSubordinates] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    }
    
    fetchTasks()
    fetchSubordinates()
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
          window.location.href = '/login'
          return
        }
        throw new Error('Ошибка загрузки задач')
      }
      
      const data = await response.json()
      console.log('Received data:', data)
      setTasks(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubordinates = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const response = await fetch(`http://localhost:3000/api/users/${user.id}/subordinates`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          setSubordinates(await response.json())
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки подчиненных:', error)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setModalOpen(true)
  }

  const handleNewTask = () => {
    setSelectedTask(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedTask(null)
  }

  const handleSaveTask = () => {
    fetchTasks()
  }

  const getTaskColor = (task: Task) => {
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

  const renderTaskItem = (task: Task) => {
    return (
      <div 
        key={task.id} 
        className="task-item" 
        style={{color: getTaskColor(task)}}
        onClick={() => handleTaskClick(task)}
      >
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
    )
  }

  const renderDateGroupedTasks = (tasks: GroupedTasks) => {
    return (
      <div className="tasks-group">
        <div className="date-group">
          <h3 className="group-title">Сегодня</h3>
          {tasks.today && tasks.today.length > 0 ? (
            tasks.today.map(renderTaskItem)
          ) : (
            <p className="no-tasks">Нет задач на сегодня</p>
          )}
        </div>

        <div className="date-group">
          <h3 className="group-title">На неделю</h3>
          {tasks.week && tasks.week.length > 0 ? (
            tasks.week.map(renderTaskItem)
          ) : (
            <p className="no-tasks">Нет задач на неделю</p>
          )}
        </div>

        <div className="date-group">
          <h3 className="group-title">На будущее</h3>
          {tasks.future && tasks.future.length > 0 ? (
            tasks.future.map(renderTaskItem)
          ) : (
            <p className="no-tasks">Нет задач на будущее</p>
          )}
        </div>
      </div>
    )
  }

  const renderResponsibleGroupedTasks = (tasks: ResponsibleGroupedTasks) => {
    return (
      <div className="tasks-group">
        {Object.keys(tasks).length > 0 ? (
          Object.entries(tasks).map(([responsible, taskList]) => (
            <div key={responsible} className="responsible-group">
              <h3 className="group-title">{responsible}</h3>
              {taskList && taskList.length > 0 ? (
                taskList.map(renderTaskItem)
              ) : (
                <p className="no-tasks">Нет задач у этого сотрудника</p>
              )}
            </div>
          ))
        ) : (
          <p className="no-tasks">Нет задач для отображения</p>
        )}
      </div>
    )
  }

  const renderUngroupedTasks = (tasks: Task[]) => {
    return (
      <div className="tasks-list">
        {tasks && tasks.length > 0 ? (
          tasks.map(renderTaskItem)
        ) : (
          <p className="no-tasks">Нет задач</p>
        )}
      </div>
    )
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
          
          <button className="new-task-btn" onClick={handleNewTask}>
            Новая задача
          </button>
        </div>
      </div>

      {grouping === 'date' && tasks && 'today' in tasks && 'week' in tasks && 'future' in tasks && (
        renderDateGroupedTasks(tasks as GroupedTasks)
      )}

      {grouping === 'responsible' && tasks && typeof tasks === 'object' && !Array.isArray(tasks) && (
        renderResponsibleGroupedTasks(tasks as ResponsibleGroupedTasks)
      )}

      {grouping === 'none' && tasks && Array.isArray(tasks) && (
        renderUngroupedTasks(tasks as Task[])
      )}

      {tasks === null && !loading && (
        <p className="no-tasks">Не удалось загрузить задачи</p>
      )}

      <TaskModal
        task={selectedTask}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        subordinates={subordinates}
        currentUserId={currentUserId} 
      />
    </div>
  )
}