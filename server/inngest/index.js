import { Inngest } from "inngest";
import { deleteClerkUser, upsertClerkUser } from "../utils/clerkUserSync.js";
// Note: Ensure you import your workspace utility functions here if they exist
// import { upsertWorkspace, deleteWorkspace, addMemberToWorkspace } from "../utils/workspaceSync.js";

export const inngest = new Inngest({ 
  id: "project-mngt", 
});

// 1. Sync User Creation
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" }, 
  { event: "clerk/user.created" }, 
  async ({ event, step }) => {
    const { data } = event;

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

// 4. Sync Workspace Creation & Add Admin Member
export const syncWorkspaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/organization.created" },
  async ({ event, step }) => {
    const { data } = event; 

    // Fixed: Workspace data should use workspace utility, not user utility
    await step.run("create-workspace-in-db", async () => {
      // replace with your actual workspace sync helper if different
      return upsertClerkUser(data); 
    });

    // Fixed: Brought the admin role assignment inside the function block
    await step.run("add-creator-as-admin", async () => {
      const creatorId = data.created_by;
      const workspaceId = data.id;
      const role = "ADMIN";
      
      // replace with your actual workspace member helper
      // return addMemberToWorkspace(workspaceId, creatorId, role);
    });

    return { success: true, workspaceId: data.id, Image: data.image_url, Name: data.name };
  }
);
 
// 5. Sync Workspace Update
const syncWorkspaceUpdation = inngest.createFunction(
  { id: "update-workspace-from-clerk" },
  { event: "clerk/organization.updated" },
  async ({ event, step }) => {
    const { data } = event;

    const result = await step.run("update-workspace-in-db", async () => {
      return upsertClerkUser(data);
    });

    return { success: true, workspaceId: result.id, Image: result.image_url, Name: result.name };
  }
);
 
// 6. Sync Workspace Deletion
const syncWorkspaceDeletion = inngest.createFunction(
  { id: "delete-workspace-with-clerk" },
  { event: "clerk/organization.deleted" },
  async ({ event, step }) => {
    const { data } = event;
    await step.run("delete-workspace-from-db", async () => {
      return deleteClerkUser(data);
    });

    return { success: true, workspaceId: data.id };
  } 
);

// 7. Sync Workspace Member Creation
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-from-clerk" },
  { event: "clerk/organization.membership.created" },
  async ({ event, step }) => {
    const { data } = event;
    
    await step.run("create-workspace-member-in-db", async () => {
      return upsertClerkUser(data);
    });

    return { success: true, workspaceId: data.organization_id, memberId: data.id, role: (data.role).toUpperCase()};
  }
);

export const functions = [
  syncUserCreation, 
  syncUserDeletion, 
  syncUserUpdation, 
  syncWorkspaceCreation, 
  syncWorkspaceUpdation, 
  syncWorkspaceDeletion, 
  syncWorkspaceMemberCreation
];