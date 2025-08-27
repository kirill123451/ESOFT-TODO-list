import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false 
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

export async function testConnetion() {
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL)
    console.log('Using DB_HOST:', process.env.DB_HOST)


    let client
    try {
        client = await pool.connect()
        console.log('PostgreSQL доступна')
    } catch (err) {
        console.error('Ошибка подключения к PostgreSQL:', err)
        process.exit(1)
    } finally {
        if (client) client.release()
    }
}

pool.on('connect', () => console.log('Новое подключение к PostgreSQL'))
pool.on('error', (err) => console.log('Ошибка подключения', err))

export default pool