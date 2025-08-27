import {Pool} from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

export async function testConnetion() {
    let client
    try {
        client = await pool.connect()
        console.log('PostgreSQL доступна')
    }catch (err) {
        console.error('Ошибка подключения к PostgreSQL:', err)
        process.exit(1)
    }finally {
        if(client) client.release()
    }
}

testConnetion()

pool.on('connect', () => console.log('Новое подключение к PostgreSQL'))
pool.on('error', (err) => console.log('Ошибка подключения', err))

export default pool