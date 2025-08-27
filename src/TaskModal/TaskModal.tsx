import { useState, useEffect } from 'react'
import './TaskModal.css'

interface Task {
  id?: number
  title: string
  description?: string
  end_date: string
  priority: 'low' | 'medium' | 'high'
  status: 'to_do' | 'in_progress' | 'done' | 'cancelled'
  responsible_id: number
  creator_id?: number
  responsible_name?: string
  responsible_surname?: string
}

interface TaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  subordinates: any[]
  currentUserId: number
}

export default function TaskModal({ task, isOpen, onClose, onSave, subordinates, currentUserId }: TaskModalProps) {
  const [formData, setFormData] = useState<Task>({
    title: '',
    description: '',
    end_date: '',
    priority: 'medium',
    status: 'to_do',
    responsible_id: 0
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const isCreator = task ? task.creator_id === currentUserId : true
  const canOnlyEditStatus = Boolean(task) && !isCreator

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        end_date: task.end_date.split('T')[0]
      })
    } else {
      setFormData({
        title: '',
        description: '',
        end_date: '',
        priority: 'medium',
        status: 'to_do',
        responsible_id: subordinates.length > 0 ? subordinates[0].id : 0
      })
    }
  }, [task, subordinates])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const url = task 
        ? `http://localhost:3000/api/tasks/${task.id}`
        : 'http://localhost:3000/api/tasks'
      
      const method = task ? 'PUT' : 'POST'
      const dataToSend = canOnlyEditStatus ? { status: formData.status } : formData

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка сохранения задачи')
      }

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении задачи')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{task ? 'Редактирование задачи' : 'Новая задача'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label className="form-label">Заголовок *</label>
            <input 
              type="text"
              className="form-input"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              disabled={isLoading || canOnlyEditStatus}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Описание</label>
            <textarea
              className="form-textarea"
              value={formData.description || ''}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              disabled={isLoading || canOnlyEditStatus}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Дата окончания *</label>
              <input
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
                required
                disabled={isLoading || canOnlyEditStatus}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Приоритет *</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as any})}
                required
                disabled={isLoading || canOnlyEditStatus}
              >
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
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                disabled={isLoading}
              >
                <option value="to_do">К выполнению</option>
                <option value="in_progress">Выполняется</option>
                <option value="done">Выполнена</option>
                <option value="cancelled">Отменена</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ответственный *</label>
              <select
                className="form-select"
                value={formData.responsible_id}
                onChange={e => setFormData({...formData, responsible_id: parseInt(e.target.value)})}
                required
                disabled={isLoading || subordinates.length === 0 || canOnlyEditStatus}
              >
                {subordinates.length === 0 ? (
                  <option value="">Нет доступных подчиненных</option>
                ) : (
                  subordinates.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.surname} {sub.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading || (!task && subordinates.length === 0)}
            >
              {isLoading ? 'Сохранение...' : (task ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}