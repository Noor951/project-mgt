import { Inngest } from "inngest";
import { deleteClerkUser, upsertClerkUser } from "../utils/clerkUserSync.js";

// Inngest Client initialization
export const inngest = new Inngest({ 
  id: "project-mngt", // Check karein dashboard par exact yehi ID ho
});

// 1. Sync User Creation
export const syncUserCreation = inngest.createFunction(
  { 
    id: "sync-user-from-clerk",
    // Agar triggers error de raha ho, toh aap triggers: [{ event: "clerk/user.created" }] try karein
  }, 
  { event: "clerk/user.created" }, 
  async ({ event, step }) => {
    const { data } = event;

    // Step logic use karna behtar hai reliability ke liye
    const result = await step.run("create-user-in-db", async () => {
      return upsertClerkUser(data);
    });

    return { success: true, userId: result.id };
  }
);

// 2. Sync User Deletion
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const { data } = event;
    
    await step.run("delete-user-from-db", async () => {
      return deleteClerkUser(data);
    });

    return { success: true, userId: data.id };
  }
);

// 3. Sync User Update
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    const { data } = event;

    const result = await step.run("update-user-in-db", async () => {
      return upsertClerkUser(data);
    });

    return { success: true, userId: result.id };
  }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];