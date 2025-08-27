import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { testConnetion } from './dataBase/db';
import { login } from './controllers/authController'; 
import { registerUser, getUserById, getUserSubordinates } from './controllers/userController';
import { getTasks, getTask, createNewTask, updateExistingTask } from './controllers/taskController';
import { authenticateToken } from './middleware/auth';

const app = express()
const PORT = process.env.PORT || 3000

app.use(cookieParser())

app.use(cors({
  origin: [
  'http://localhost:5173',
  'https://esoft-todo-list-front.up.railway.app' 
],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.post('/api/auth/login', login)
app.post('/api/users', registerUser)

app.get('/api/tasks', authenticateToken, getTasks)
app.get('/api/tasks/:id', authenticateToken, getTask)
app.post('/api/tasks', authenticateToken, createNewTask)
app.put('/api/tasks/:id', authenticateToken, updateExistingTask)

app.get('/api/users/:id', authenticateToken, getUserById)
app.get('/api/users/:leaderId/subordinates', authenticateToken, getUserSubordinates)

app.get('/api/auth/check', authenticateToken, (req, res) => {
  res.json({ authenticated: true })
})

app.get('/api/health', (req, res) => {
  res.json({ message: 'Сервер работает!' })
})

app.listen(PORT, () => {
  console.log(`Сервер запущен на порте ${PORT}`)
  testConnetion()
})