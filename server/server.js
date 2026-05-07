import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// 1. CORS
app.use(cors());

// 2. Inngest Route — Isay sab se upar rakhein taake koi middleware isay block na kare
// Signing Key yahan pass karna lazmi hai
app.use("/api/inngest", serve({ 
  client: inngest, 
  functions,
  signingKey: process.env.INNGEST_SIGNING_KEY 
}));

// 3. Body parser — Inngest ke baad (ya pehle, lekin Inngest handle kar leta hai)
app.use(express.json());

// 4. Clerk middleware
app.use(clerkMiddleware());

// 5. Routes
app.get('/', (req, res) => res.send('server is live!'));

// 6. Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;