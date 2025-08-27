import pool from "../dataBase/db";

export interface User {
    id?: number
    name: string
    surname: string
    patronymic?: string
    login: string
    password_hash: string
    leader_id?: number
}

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const query = `
        INSERT INTO users (name, surname, patronymic, login, password_hash, leader_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, surname, patronymic, login, leader_id
    `
    
    const { rows } = await pool.query(query, [
        userData.name,
        userData.surname,
        userData.patronymic,
        userData.login,
        userData.password_hash,
        userData.leader_id
    ])
    
    return rows[0]
}

export const findUserById = async (id: number): Promise<User | null> => {
    const query = `SELECT * FROM users WHERE id = $1`
    const { rows } = await pool.query(query, [id])
    return rows[0] || null
}

export const findUserByLogin = async (login: string): Promise<User | null> => {
    const query = `SELECT * FROM users WHERE login = $1`
    const { rows } = await pool.query(query, [login])
    return rows[0] || null
}

export const getSubordinates = async (leaderId: number): Promise<User[]> => {
  console.log(`Getting subordinates for leader: ${leaderId}`);
  
  const query = `
    SELECT id, name, surname, patronymic, login 
    FROM users 
    WHERE leader_id = $1
  `;
  
  try {
    const { rows } = await pool.query(query, [leaderId]);
    console.log(`Found ${rows.length} subordinates`);
    return rows;
  } catch (error) {
    console.error('Error in getSubordinates:', error);
    return [];
  }
};

export const isUserSubordinate = async (leaderId: number, subordinateId: number): Promise<boolean> => {
    const query = `SELECT id FROM users WHERE id = $1 AND leader_id = $2`;
    const { rows } = await pool.query(query, [subordinateId, leaderId]);
    return rows.length > 0
}