import { Request, Response } from 'express';
import { findUserByLogin } from '../models/user';
import { completePasswords, generateToken } from '../utils/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, password } = req.body

    if (!login || !password) {
      res.status(400).json({ error: 'Логин и пароль обязательны' })
      return
    }

    const user = await findUserByLogin(login)
    if (!user) {
      res.status(401).json({ error: 'Пользователь с таким логином не существует' })
      return
    }

    const isPasswordValid = await completePasswords(password, user.password_hash)
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Неверный пароль' })
      return
    }

    const token = generateToken(user.id!)

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    })

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        patronymic: user.patronymic,
        login: user.login,
        leader_id: user.leader_id
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Ошибка при входе' })
  }
}

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token')
  res.json({ message: 'Выход выполнен успешно' })
}