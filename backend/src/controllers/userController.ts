import { Request, Response } from 'express';
import { createUser, findUserById, findUserByLogin, getSubordinates } from '../models/user';
import { hashPassword } from '../utils/auth';
import { generateToken } from '../utils/auth';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, surname, patronymic, login, password, leader_id } = req.body

        if (!login || !password || !name || !surname) {
            res.status(400).json({ error: 'Логин, пароль, имя и фамилия обязательны!' })
            return
        }

        const existingUser = await findUserByLogin(login)
        if (existingUser) {
            res.status(400).json({ error: 'Пользователь с таким логином уже существует' })
            return
        }

        const password_hash = await hashPassword(password)

        const user = await createUser({
            name,
            surname,
            patronymic,
            login,
            password_hash,
            leader_id
        })

        const token = generateToken(user.id!)

        res.status(201).json({
            message: 'Пользователь успешно создан',
            token,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                patronymic: user.patronymic,
                login: user.login,
                leader_id: user.leader_id
            }
        })

    } catch (err) {
        console.error('Ошибка создания пользователя', err)
        res.status(500).json({ error: 'Внутренняя ошибка сервера' })
    }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id)
        
        const user = await findUserById(id)
        if (!user) {
            res.status(404).json({ error: 'Пользователь не найден' })
            return
        }

        const { password_hash, ...userWithoutPassword } = user
        res.status(200).json(userWithoutPassword)

    } catch (err) {
        console.error('Ошибка получения пользователя', err)
        res.status(500).json({ error: 'Внутренняя ошибка сервера' })
    }
}

export const getUserSubordinates = async (req: Request, res: Response): Promise<void> => {
    try {
        const leaderId = parseInt(req.params.leaderId)
        
        const subordinates = await getSubordinates(leaderId)
        res.status(200).json(subordinates)

    } catch (err) {
        console.error('Ошибка получения подчиненных', err)
        res.status(500).json({ error: 'Внутренняя ошибка сервера' })
    }
}