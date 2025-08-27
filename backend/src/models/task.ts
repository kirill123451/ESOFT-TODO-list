import pool from "../dataBase/db";

export interface Task {
    id?: number
    title: string
    description?: string
    end_date: Date
    created_at?: Date
    updated_at?: Date
    priority: 'low' | 'mediun' | 'high'
    status: 'to_do' | 'in_progress' | 'done' | 'cancelled'
    creator_id: number
    responsible_id: number
}

export const createTask = async (Data: Omit<Task, 'id'>): Promise<Task> => {
    const query = `
    INSERT INTO tasks (title, description, end_date, priority, status, creator_id, responsible_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `
    const {rows} = await pool.query(query, [
        Data.title,
        Data.description,
        Data.end_date,
        Data.priority,
        Data.status,
        Data.creator_id,
        Data.responsible_id
    ])
    return rows[0]

}

export const findTaskById = async (id: number): Promise<Task | null> => {
    const query = `
        SELECT tasks.*, 
        creator.name AS creator_name, 
        creator.surname AS creator_surname,
        responsible.name AS responsible_name,
        responsible.surname AS responsible_surname
        FROM tasks
        JOIN users creator ON tasks.creator_id = creator.id
        JOIN users responsible ON tasks.responsible_id = responsible.id
        WHERE tasks.id = $1
    `

    const {rows} = await pool.query(query, [id])
    return rows[0] || null
}

export const updateTask = async (id: number, updates: Partial<Task>): Promise<Task | null> => {
  const fields = []
  const values = []
  let paramCount = 1

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = $${paramCount}`)
      values.push(value)
      paramCount++
    }
  }

  if (fields.length === 0) {
    return findTaskById(id)
  }

  fields.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`
  const { rows } = await pool.query(query, values)
  return rows[0] || null
}

export const getUserTasks = async (userId: number): Promise<Task[]> => {
  const query = `
    SELECT tasks.*, 
       creator.name AS creator_name, 
       creator.surname AS creator_surname,
       responsible.name AS responsible_name,
       responsible.surname AS responsible_surname
    FROM tasks
    JOIN users creator ON tasks.creator_id = creator.id
    JOIN users responsible ON tasks.responsible_id = responsible.id
    WHERE tasks.responsible_id = $1 OR tasks.creator_id = $1
    ORDER BY tasks.updated_at DESC
  `
  const { rows } = await pool.query(query, [userId])
  return rows
}

export const getTasksByDateGroup = async (userId: number): Promise<{
  today: Task[]
  week: Task[]
  future: Task[]
}> => {
  const today = new Date().toISOString().split('T')[0]
  const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const query = `
    SELECT tasks.*, 
       creator.name AS creator_name, 
       creator.surname AS creator_surname,
       responsible.name AS responsible_name,
       responsible.surname AS responsible_surname
    FROM tasks
    JOIN users creator ON tasks.creator_id = creator.id
    JOIN users responsible ON tasks.responsible_id = responsible.id
    WHERE tasks.responsible_id = $1
    ORDER BY tasks.updated_at DESC
  `

  const { rows } = await pool.query(query, [userId])
  const tasks = rows

  return {
    today: tasks.filter(task => task.end_date === today && task.status !== 'done' && task.status !== 'cancelled'),
    week: tasks.filter(task => 
      task.end_date > today && 
      task.end_date <= weekLater && 
      task.status !== 'done' && 
      task.status !== 'cancelled'
    ),
    future: tasks.filter(task => 
      task.end_date > weekLater && 
      task.status !== 'done' && 
      task.status !== 'cancelled'
    )
  }
}

export const getTasksByResponsible = async (leaderId: number): Promise<{ [key: string]: Task[] }> => {
  const query = `
    SELECT t.*, 
           creator.name as creator_name, 
           creator.surname as creator_surname,
           responsible.id as responsible_id,
           responsible.name as responsible_name,
           responsible.surname as responsible_surname
    FROM tasks t
    JOIN users creator ON t.creator_id = creator.id
    JOIN users responsible ON t.responsible_id = responsible.id
    WHERE responsible.leader_id = $1
    ORDER BY responsible.surname, responsible.name, t.updated_at DESC
  `

  const { rows } = await pool.query(query, [leaderId])
  const tasks = rows

  const grouped: { [key: string]: Task[] } = {}
  tasks.forEach(task => {
    const key = `${task.responsible_surname} ${task.responsible_name}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(task)
  })

  return grouped
}