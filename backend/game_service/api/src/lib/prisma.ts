import { PrismaClient } from '@prisma/client';
<<<<<<< HEAD
import dotenv from 'dotenv';
=======
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
>>>>>>> 1893babdcdb759c06251eeca73adc603da066f95

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
    adapter,
    log: ["error", "query", "warn", "info"]
});

dotenv.config({ path: '/vault/secrets/database.env' });

export default prisma;