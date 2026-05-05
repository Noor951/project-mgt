import 'dotenv/config';
import { PrismaClient } from '@prisma/client'; // Direct named import use karein
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless'; // Neon pooler lazmi hai

const globalForPrisma = globalThis;

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  
  // Neon serverless adapter setup
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  
  return new PrismaClient({ adapter });
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;