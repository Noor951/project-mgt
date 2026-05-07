import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

app.use(cors());

// IMPORTANT: Inngest route ko body-parser (express.json) se PEHLE rakhein 
// ya isay simple rakhein kyunki Inngest apna parser use karta hai.
app.use("/api/inngest", serve({ 
  client: inngest, 
  functions,
  signingKey: process.env.INNGEST_SIGNING_KEY // Is key ke bagair sync fail hoga
}));

app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('server is live!'));

app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;