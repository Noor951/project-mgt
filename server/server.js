

import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { Webhook } from 'svix';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import { deleteClerkUser, upsertClerkUser } from "./utils/clerkUserSync.js";
import { bootstrapWorkspaceForUser, createProjectForWorkspace } from "./utils/workspaceSync.js";

const app = express();
app.use(cors());

app.post("/api/webhooks/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "CLERK_WEBHOOK_SECRET is not configured" });
  }

  const svixHeaders = {
    "svix-id": req.headers["svix-id"],
    "svix-timestamp": req.headers["svix-timestamp"],
    "svix-signature": req.headers["svix-signature"],
  };

  let event;

  try {
    event = new Webhook(secret).verify(req.body, svixHeaders);
  } catch (error) {
    return res.status(400).json({ error: "Invalid Clerk webhook signature" });
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      await upsertClerkUser(event.data);
    }

    if (event.type === "user.deleted") {
      await deleteClerkUser(event.data);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to sync Clerk user" });
  }
});

app.use(express.json());

app.post("/api/users/sync", async (req, res) => {
  try {
    const user = req.body?.user ?? req.body;
    console.log('[users/sync] incoming user:', { id: user?.id, email: user?.primary_email_address || user?.email });
    const record = await upsertClerkUser(user);
    console.log('[users/sync] upserted user id=', record.id);

    return res.status(200).json({ success: true, userId: record.id });
  } catch (error) {
    console.error('[users/sync] error', error?.message || error);
    return res.status(500).json({ error: "Failed to sync user" });
  }
});

app.post("/api/workspaces/bootstrap", async (req, res) => {
  try {
    const user = req.body?.user ?? req.body;
    console.log('[workspaces/bootstrap] incoming user:', { id: user?.id, email: user?.primary_email_address || user?.email });
    const workspace = await bootstrapWorkspaceForUser(user);
    console.log('[workspaces/bootstrap] workspace id=', workspace?.id, 'owner=', workspace?.ownerId);

    return res.status(200).json({ success: true, workspace });
  } catch (error) {
    console.error('[workspaces/bootstrap] error', error?.message || error);
    return res.status(500).json({ error: error?.message || "Failed to bootstrap workspace" });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const result = await createProjectForWorkspace(req.body);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ error: error?.message || "Failed to create project" });
  }
});

// Inngest route - Signing key sirf production mein verify hogi
app.use("/api/inngest", serve({ 
  client: inngest, 
  functions,
  signingKey: process.env.INNGEST_SIGNING_KEY 
}));
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.send('Server is live and Inngest is ready!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;