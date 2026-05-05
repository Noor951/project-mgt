import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../prisma/generated/client/index.js";

// Serverless-safe singleton pattern
// Prevents "too many connections" on Vercel/serverless environments
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
