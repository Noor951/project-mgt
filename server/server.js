import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();
app.use(cors());

// ✅ CRITICAL: Raw body for Inngest BEFORE express.json()
app.use(
  "/api/inngest",
  express.raw({ type: "*/*" }),  // */* not just application/json
  serve({ 
    client: inngest, 
    functions,
    // Do NOT pass signingKey manually — let SDK read from env
  })
);

// Global middleware AFTER inngest route
app.use(express.json());
app.use(clerkMiddleware());

// Debug route (remove after fixing)
app.get('/api/debug-inngest', (req, res) => {
  res.json({
    hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
    keyPrefix: process.env.INNGEST_SIGNING_KEY?.slice(0, 22),
    vercelUrl: process.env.VERCEL_URL,
  });
});

app.get('/', (req, res) => {
  res.send('Server is live and Inngest is ready!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;