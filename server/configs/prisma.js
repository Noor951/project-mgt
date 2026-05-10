import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Hardcoded connection string for stability
const connectionString = "postgresql://neondb_owner:npg_LYZQBg7pPH6F@ep-weathered-feather-am1ddnwf-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// Prisma 7 mein hum datasource connection yahan pass karte hain
const prisma = new PrismaClient({ 
  adapter,
  datasourceUrl: connectionString 
});

export default prisma;