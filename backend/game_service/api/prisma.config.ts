import { defineConfig } from "prisma/config";
import * as dotenv from 'dotenv';

// Manually load your vault secret into the process
dotenv.config({ path: '/vault/secrets/database.env' });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});