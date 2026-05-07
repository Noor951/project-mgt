import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ 
  id: "project-mngt",
});

export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" }, 
  { event: "clerk/user.created" }, 
  async ({ event }) => {
    try {
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
    } catch (err) {
      console.error("syncUserCreation error:", err.message);
      throw err;
    }
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { data } = event;
      await prisma.user.delete({ where: { id: data.id } });
      return { success: true, userId: data.id };
    } catch (err) {
      console.error("syncUserDeletion error:", err.message);
      throw err;
    }
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
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
    } catch (err) {
      console.error("syncUserUpdation error:", err.message);
      throw err;
    }
  }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];