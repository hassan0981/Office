"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { loginSchema, signupSchema, resetPasswordSchema, LoginFormValues, SignupFormValues, ResetPasswordFormValues } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";

export async function loginAction(data: LoginFormValues) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signupAction(data: SignupFormValues) {
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (authData.user) {
    try {
      await prisma.user.upsert({
        where: { id: authData.user.id },
        update: { email: parsed.data.email, name: parsed.data.name },
        create: {
          id: authData.user.id,
          email: parsed.data.email,
          name: parsed.data.name,
        },
      });
    } catch (e) {
      console.warn("Prisma user synchronization notice:", e);
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function resetPasswordAction(data: ResetPasswordFormValues) {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
