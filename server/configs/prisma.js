import { PrismaClient } from "@prisma/client";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Yahan hum check kar rahe hain ke URL mil raha hai ya nahi
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DANGER: DATABASE_URL is not defined in Environment Variables!");
}

const pool = new Pool({ connectionString: connectionString });
const adapter = new PrismaNeon(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;