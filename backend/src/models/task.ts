import pool from "../dataBase/db";

export interface Task {
    id?: number
    title: string
    description?: string
    end_date: Date
    created_at?: Date
    updated_at?: Date
    priority: 'low' | 'medium' | 'high'
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
  // Поля, которые нельзя обновлять напрямую в таблице tasks
  const excludedFields = [
    'creator_name', 
    'creator_surname', 
    'responsible_name', 
    'responsible_surname',
    'updated_at' // Исключаем updated_at из updates, так как мы устанавливаем его явно
  ];
  
  const fields: string[] = []
  const values: any[] = []
  let paramCount = 1

  for (const [key, value] of Object.entries(updates)) {
    // Пропускаем исключенные поля и undefined значения
    if (value !== undefined && !excludedFields.includes(key) && key !== 'id') {
      fields.push(`${key} = $${paramCount}`)
      values.push(value)
      paramCount++
    }
  }

  if (fields.length === 0) {
    return findTaskById(id)
  }

  // Добавляем обновление updated_at только один раз
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
    WHERE tasks.responsible_id = $1 
       OR tasks.creator_id = $1
       OR responsible.leader_id = $1
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 7);
  
  const future = new Date(weekLater);
  future.setDate(weekLater.getDate() + 1);

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
    today: tasks.filter(task => {
      const taskDate = new Date(task.end_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime() && 
             task.status !== 'done' && 
             task.status !== 'cancelled';
    }),
    week: tasks.filter(task => {
      const taskDate = new Date(task.end_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > today && 
             taskDate <= weekLater && 
             task.status !== 'done' && 
             task.status !== 'cancelled';
    }),
    future: tasks.filter(task => {
      const taskDate = new Date(task.end_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > weekLater && 
             task.status !== 'done' && 
             task.status !== 'cancelled';
    })
  }
}

export const getTasksByResponsible = async (leaderId: number): Promise<{ [key: string]: Task[] }> => {
  try {
    console.log(`Getting tasks for leader: ${leaderId}`);
    
    // Сначала получаем всех подчиненных
    const subordinatesQuery = `
      SELECT id, name, surname 
      FROM users 
      WHERE leader_id = $1
    `;
    const { rows: subordinates } = await pool.query(subordinatesQuery, [leaderId]);
    
    console.log(`Subordinates found: ${subordinates.length}`);
    
    // Если нет подчиненных, возвращаем пустой объект
    if (subordinates.length === 0) {
      console.log('No subordinates found');
      return {};
    }

    // Получаем задачи всех подчиненных
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
    `;

    const { rows } = await pool.query(query, [leaderId]);
    console.log(`Tasks found: ${rows.length}`);

    // Создаем объект с пустыми массивами для всех подчиненных
    const grouped: { [key: string]: Task[] } = {};
    
    // Сначала добавляем всех подчиненных, даже если у них нет задач
    subordinates.forEach(sub => {
      const key = `${sub.surname} ${sub.name}`;
      grouped[key] = [];
    });

    // Затем заполняем объект задачами
    rows.forEach(task => {
      const key = `${task.responsible_surname} ${task.responsible_name}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(task);
    });

    console.log(`Final grouped data:`, grouped);
    return grouped;
  } catch (error) {
    console.error('Error in getTasksByResponsible:', error);
    return {};
  }
};