import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

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
      return await prisma.user.create({
        data: {
          id: data.id,
          email: data?.email_addresses?.[0]?.email_address || "",
          name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
          image: data?.image_url || "",
        },
      });
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
      return await prisma.user.delete({ 
        where: { id: data.id } 
      });
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
      return await prisma.user.update({
        where: { id: data.id },
        data: {
          email: data?.email_addresses?.[0]?.email_address || "",
          name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
          image: data?.image_url || "",
        },
      });
    });

    return { success: true, userId: result.id };
  }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];