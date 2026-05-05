import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// 1. CORS
app.use(cors());

// 2. Body parser — MUST come before Inngest route
app.use(express.json());

// 3. Clerk middleware
app.use(clerkMiddleware());

// 4. Routes
app.get('/', (req, res) => res.send('server is live!'));
app.use("/api/inngest", serve({ client: inngest, functions }));

// 5. Global error handler — prevents unhandled crashes from returning 500 silently
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app; // Vercel needs a default export for serverless
