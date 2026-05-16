import dotenv from 'dotenv';
import { defineConfig } from '@prisma/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL?.trim(),
  },
  migrate: {
    directUrl: process.env.DIRECT_DATABASE_URL?.trim(),
  },
});