import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// 1. CORS - Isay hamesha top par rakhein
app.use(cors());

// 2. Inngest Route - Isay express.json() se pehle rakhein taake sync masla na kare
// Overview mein "Server is live" isi wajah se stable rahega
app.use("/api/inngest", serve({ 
  client: inngest, 
  functions,
  signingKey: process.env.INNGEST_SIGNING_KEY 
}));

// 3. Body parser - Baki normal routes ke liye
app.use(express.json());

// 4. Clerk middleware
app.use(clerkMiddleware());

// 5. Default Route - Ye Vercel Overview mein "Server is live" dikhayega
app.get('/', (req, res) => {
  res.status(200).send('Server is live and Inngest is ready!');
});

// 6. Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    info: 'Check Vercel logs for Prisma or Inngest initialization errors'
  });
});

const PORT = process.env.PORT || 5000;

// Local development ke liye
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;