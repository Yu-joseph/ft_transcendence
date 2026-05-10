import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
    adapter,
    log: ["error", "query", "warn", "info"]
});

dotenv.config({ path: '/vault/secrets/database.env' });

export default prisma;