import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createTask, updateTask, getUserTasks, getTasksByDateGroup, getTasksByResponsible, findTaskById } from '../models/task';
import { findUserById, isUserSubordinate } from '../models/user';

export const createNewTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, end_date, priority, status, responsible_id } = req.body
    const creator_id = req.userId!

    if (!title || !end_date || !priority || !responsible_id) {
      res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' })
      return
    }

    const isSubordinate = await isUserSubordinate(creator_id, responsible_id)
    if (!isSubordinate) {
      res.status(403).json({ error: 'Можно назначать задачи только своим подчиненным' })
      return
    }

    const task = await createTask({
      title,
      description,
      end_date: new Date(end_date),
      priority,
      status: status || 'to_do',
      creator_id,
      responsible_id
    })

    res.status(201).json({
      message: 'Задача успешно создана',
      task
    })

  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ error: 'Ошибка при создании задачи' })
  }
}

export const updateExistingTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id)
    const userId = req.userId!
    const updates = req.body

    const task = await findTaskById(taskId)
    if (!task) {
      res.status(404).json({ error: 'Задача не найдена' })
      return
    }

    const currentUser = await findUserById(userId)
    const isCreatorLeader = currentUser?.leader_id === task.creator_id
    const isTaskCreator = task.creator_id === userId
    const isResponsible = task.responsible_id === userId

    if (!isTaskCreator && !isResponsible && !isCreatorLeader) {
      res.status(403).json({ error: 'Нет прав для редактирования этой задачи' })
      return
    }

    if (!isTaskCreator && Object.keys(updates).some(key => key !== 'status')) {
      res.status(403).json({ error: 'Можно изменять только статус задачи' })
      return
    }

    if (updates.responsible_id) {
      const isSubordinate = await isUserSubordinate(userId, updates.responsible_id)
      if (!isSubordinate) {
        res.status(403).json({ error: 'Можно назначать задачи только своим подчиненным' })
        return
      }
    }

    const updatedTask = await updateTask(taskId, updates)
    res.json({
      message: 'Задача успешно обновлена',
      task: updatedTask
    })

  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ error: 'Ошибка при обновлении задачи' })
  }
}

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const { group } = req.query

    let tasks

    if (group === 'date') {
      tasks = await getTasksByDateGroup(userId)
    } else if (group === 'responsible') {
      tasks = await getTasksByResponsible(userId)
    } else {
      tasks = await getUserTasks(userId)
    }

    res.json(tasks)

  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({ error: 'Ошибка при получении задач' })
  }
}

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id)
    const userId = req.userId!

    const task = await findTaskById(taskId)
    if (!task) {
      res.status(404).json({ error: 'Задача не найдена' })
      return
    }

    const isTaskCreator = task.creator_id === userId
    const isResponsible = task.responsible_id === userId
    const currentUser = await findUserById(userId)
    const isCreatorLeader = currentUser?.leader_id === task.creator_id

    if (!isTaskCreator && !isResponsible && !isCreatorLeader) {
      res.status(403).json({ error: 'Нет прав для просмотра этой задачи' })
      return
    }

    res.json(task)

  } catch (error) {
    console.error('Get task error:', error)
    res.status(500).json({ error: 'Ошибка при получении задачи' })
  }
}