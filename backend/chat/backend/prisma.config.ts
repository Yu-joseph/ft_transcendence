import { defineConfig, env } from 'prisma/config';
import * as dotenv from 'dotenv';

// Manually load your vault secret into the process
dotenv.config({ path: '/vault/secrets/database.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma', // Path to your schema
  datasource: {
    // This looks for "DATABASE_URL" in the process.env we just populated
    url: env('DATABASE_URL'),
  }
});