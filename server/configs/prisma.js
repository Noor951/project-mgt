import { PrismaClient } from "@prisma/client";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

// AGAR URL NAHI HAI TOH CODE YAHI STOP HO JAYE
if (!connectionString || connectionString === "undefined") {
  throw new Error("FATAL: DATABASE_URL is not found in process.env. Check Vercel Dashboard.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const prisma = new PrismaClient({ 
  adapter,
  log: ['query', 'error', 'warn'] // Is se logs mein exact query nazar ayegi
});

export default prisma;