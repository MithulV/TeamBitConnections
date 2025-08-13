import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
const db = postgres(connectionString)

export default db