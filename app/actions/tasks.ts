"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { taskSchema, TaskFormValues } from "@/lib/validations/task";
import { Status, Priority } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getTasksAction(
  filterStatus?: string,
  filterPriority?: string,
  sortBy: "dueDate" | "priority" | "createdAt" = "createdAt"
) {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated", tasks: [] };
  }

  try {
    const whereClause: any = {
      userId: user.id,
    };

    if (filterStatus && filterStatus !== "ALL") {
      whereClause.status = filterStatus as Status;
    }

    if (filterPriority && filterPriority !== "ALL") {
      whereClause.priority = filterPriority as Priority;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "dueDate") {
      orderBy = { dueDate: "asc" };
    } else if (sortBy === "priority") {
      orderBy = { priority: "desc" };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy,
    });

    return { tasks };
  } catch (e) {
    console.error("Error fetching tasks:", e);
    return { error: "Failed to fetch tasks from database", tasks: [] };
  }
}

export async function getTaskByIdAction(taskId: string) {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated", task: null };
  }

  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: user.id,
      },
    });

    return { task };
  } catch (e) {
    return { error: "Task not found", task: null };
  }
}

export async function createTaskAction(data: TaskFormValues) {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated" };
  }

  const parsed = taskSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    // Ensure User entry exists in DB
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email || `${user.id}@example.com`,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      },
    });

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        status: parsed.data.status as Status,
        priority: parsed.data.priority as Priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (e: any) {
    console.error("Task creation error:", e);
    return { error: e.message || "Failed to create task" };
  }
}

export async function updateTaskAction(taskId: string, data: TaskFormValues) {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated" };
  }

  const parsed = taskSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!existing) {
      return { error: "Task not found or access denied" };
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        status: parsed.data.status as Status,
        priority: parsed.data.priority as Priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, task };
  } catch (e: any) {
    return { error: e.message || "Failed to update task" };
  }
}

export async function toggleTaskStatusAction(taskId: string, status: Status) {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated" };
  }

  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!existing) {
      return { error: "Task not found" };
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (e: any) {
    return { error: e.message || "Failed to update status" };
  }
}

export async function deleteTaskAction(taskId: string) {
  const user = await getAuthUser();
  if (!user) {
    return { error: "Unauthenticated" };
  }

  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!existing) {
      return { error: "Task not found" };
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete task" };
  }
}
