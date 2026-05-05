import 'dotenv/config';
// ESM mein PrismaClient ko direct import karne ke bajaye poora package uthana behtar hai
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import { PrismaNeon } from '@prisma/adapter-neon';

// Serverless-safe singleton pattern
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  // Connection string check
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaNeon({ connectionString });
  
  return new PrismaClient({ adapter });
};

// Agar global mein pehle se prisma hai toh wahi use karo, warna naya banao
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;