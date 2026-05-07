import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();
app.use(cors());

// ✅ THE FIX: serve() must come before ANY body parser middleware
// Do NOT add express.raw() — Inngest handles its own body parsing internally
app.use("/api/inngest", serve({ client: inngest, functions }));

// Body parsers AFTER inngest route
app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.send('Server is live and Inngest is ready!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;