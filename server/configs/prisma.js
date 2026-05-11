import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// WebSocket setup for Serverless
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = "postgresql://neondb_owner:npg_LYZQBg7pPH6F@ep-weathered-feather-am1ddnwf.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// Prisma 7 Fix: Constructor ko bilkul empty rakhien ya sirf adapter dein
// Connection string automatically pool/adapter ke zariye handle hogi
const prisma = new PrismaClient({ adapter });

export default prisma;