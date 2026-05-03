import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

dotenv.config({ path: '/vault/secrets/database.env' });

export default prisma;