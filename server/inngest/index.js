import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ id: "project-mngt" });

// 1. Sync User Creation
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses?.[0]?.email_address || "",
        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
        image: data?.image_url || "",
      },
    });
    return { success: true, userId: data.id };
  }
);

// 2. Sync User Deletion
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: { id: data.id },
    });
    return { success: true, userId: data.id };
  }
);

// 3. Sync User Update
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data?.email_addresses?.[0]?.email_address || "",
        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
        image: data?.image_url || "",
      },
    });
    return { success: true, userId: data.id };
  }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
