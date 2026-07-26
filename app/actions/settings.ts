"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getApiTokenAction() {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated", token: null };
  }

  try {
    const activeToken = await prisma.apiToken.findFirst({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!activeToken) {
      return { token: null };
    }

    // Since the database only stores the SHA-256 hash, we cannot retrieve
    // the original token. We return a masked placeholder indicating it exists.
    return { token: "tf_••••••••••••••••••••••••••••••••" };
  } catch (e: any) {
    console.error("Error getting api token:", e);
    return { error: "Failed to get token", token: null };
  }
}

export async function generateApiTokenAction() {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated" };
  }

  try {
    // Revoke any existing active tokens for this user first
    await prisma.apiToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Generate a secure raw token (prefixed with tf_)
    const rawToken = `tf_${crypto.randomBytes(24).toString("hex")}`;
    
    // Hash the token using SHA-256
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Ensure User entry exists in DB
    const userEmail = user.email || `${user.id}@example.com`;
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || null;

    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: userEmail,
        name: userName,
      },
    });

    // Create the active token record
    await prisma.apiToken.create({
      data: {
        tokenHash,
        label: "FocusFlow Extension",
        userId: user.id,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, token: rawToken };
  } catch (e: any) {
    console.error("Error generating API token:", e);
    return { error: "Failed to generate API token" };
  }
}

export async function revokeApiTokenAction() {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated" };
  }

  try {
    await prisma.apiToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e: any) {
    console.error("Error revoking API token:", e);
    return { error: "Failed to revoke API token" };
  }
}
