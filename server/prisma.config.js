import { defineConfig } from '@prisma/config';
// Aisa hona chahiye

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    directUrl: process.env.DIRECT_DATABASE_URL,
  },
});