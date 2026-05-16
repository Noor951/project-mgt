import prisma from "../configs/prisma.js";

function getClerkUserPayload(data) {
  const userId = data?.id;

  if (!userId) {
    throw new Error("Clerk user id is missing");
  }

  const email =
    data?.email_addresses?.[0]?.email_address ||
    data?.emailAddresses?.[0]?.emailAddress ||
    data?.primary_email_address ||
    data?.primaryEmailAddress?.emailAddress ||
    `${userId}@clerk.local`;

  const name =
    `${data?.first_name || data?.firstName || ""} ${data?.last_name || data?.lastName || ""}`.trim() ||
    data?.username ||
    email;

  const image = data?.image_url || data?.imageUrl || "";

  return { userId, email, name, image };
}

export async function upsertClerkUser(data) {
  const { userId, email, name, image } = getClerkUserPayload(data);

  return prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      name,
      image,
    },
    update: {
      email,
      name,
      image,
    },
  });
}

export async function deleteClerkUser(data) {
  const userId = data?.id;

  if (!userId) {
    throw new Error("Clerk user id is missing");
  }

  return prisma.user.deleteMany({
    where: { id: userId },
  });
}