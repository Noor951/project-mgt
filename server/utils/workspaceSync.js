import { randomUUID } from "node:crypto";
import prisma from "../configs/prisma.js";
import { upsertClerkUser } from "./clerkUserSync.js";

function isUniqueConstraintError(error) {
  return error?.code === "P2002";
}

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function makeSlug(value) {
  return String(value || "workspace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workspace";
}

function workspaceInclude() {
  return {
    owner: true,
    members: {
      include: {
        user: true,
      },
    },
    projects: {
      include: {
        owner: true,
        workspace: true,
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          include: {
            assignee: true,
            comments: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    },
  };
}

function projectInclude() {
  return {
    owner: true,
    workspace: {
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    },
    members: {
      include: {
        user: true,
      },
    },
    tasks: {
      include: {
        assignee: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
    },
  };
}

export async function bootstrapWorkspaceForUser(userData) {
  const user = await upsertClerkUser(userData);
  const workspaceSlug = `${makeSlug(user.email || user.id)}-${user.id.slice(0, 8)}`;

  let workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
    include: workspaceInclude(),
  });

  if (!workspace) {
    const workspaceName = user.name ? `${user.name.split(" ")[0]}'s Workspace` : "My Workspace";

    try {
      workspace = await prisma.workspace.create({
        data: {
          id: randomUUID(),
          name: workspaceName,
          slug: workspaceSlug,
          description: null,
          settings: {},
          ownerId: user.id,
          image_url: "",
          members: {
            create: [
              {
                userId: user.id,
                message: "",
                role: "ADMIN",
              },
            ],
          },
        },
        include: workspaceInclude(),
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      workspace = await prisma.workspace.findFirst({
        where: {
          OR: [{ ownerId: user.id }, { slug: workspaceSlug }],
        },
        include: workspaceInclude(),
      });

      if (!workspace) {
        throw error;
      }
    }
  } else {
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
      create: {
        userId: user.id,
        workspaceId: workspace.id,
        message: "",
        role: "ADMIN",
      },
      update: {
        role: "ADMIN",
      },
    });

    workspace = await prisma.workspace.findUnique({
      where: { id: workspace.id },
      include: workspaceInclude(),
    });
  }

  return workspace;
}

export async function createProjectForWorkspace(input) {
  const workspaceId = input?.workspaceId;
  const userId = input?.userId;

  if (!workspaceId) {
    throw new Error("workspaceId is required");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  const teamLeadId = input?.team_lead || userId;
  const teamMemberIds = Array.isArray(input?.team_members)
    ? Array.from(new Set(input.team_members.filter(Boolean).concat(teamLeadId)))
    : [teamLeadId];

  const project = await prisma.project.create({
    data: {
      id: randomUUID(),
      name: input.name,
      description: input.description || null,
      priority: input.priority || "MEDIUM",
      status: input.status || "PLANNING",
      start_date: normalizeDate(input.start_date),
      end_date: normalizeDate(input.end_date),
      team_lead: teamLeadId,
      workspaceId,
      progress: Number.isFinite(Number(input.progress)) ? Number(input.progress) : 0,
    },
  });

  if (teamMemberIds.length > 0) {
    await prisma.projectMember.createMany({
      data: teamMemberIds.map((memberId) => ({
        userId: memberId,
        projectId: project.id,
      })),
      skipDuplicates: true,
    });
  }

  const createdProject = await prisma.project.findUnique({
    where: { id: project.id },
    include: projectInclude(),
  });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: workspaceInclude(),
  });

  return { project: createdProject, workspace };
}