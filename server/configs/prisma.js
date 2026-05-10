// prisma.js
import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// configs/prisma.js
const connectionString = "postgresql://neondb_owner:npg_LYZQBg7pPH6F@ep-weathered-feather-am1ddnwf-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not set. Check your .env file.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;