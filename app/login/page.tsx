"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, resetPasswordSchema, LoginFormValues, ResetPasswordFormValues } from "@/lib/validations/auth";
import { loginAction, resetPasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { CheckSquare, Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await loginAction(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e: any) {
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormValues) => {
    setIsResetting(true);
    try {
      const res = await resetPasswordAction(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Password reset instructions sent to your email.");
        setIsResetOpen(false);
        resetResetForm();
      }
    } catch (e) {
      toast.error("Failed to send reset email.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-warm-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta-500 text-white shadow-md">
            <CheckSquare className="h-6 w-6 stroke-[2.5]" />
          </div>
          <CardTitle className="text-2xl font-bold text-charcoal-900">
            Sign In to TaskFlow
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your workspace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-charcoal-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(true)}
                  className="text-xs font-medium text-terracotta-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-charcoal-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gap-2 mt-2 font-semibold"
              isLoading={isLoading}
            >
              <LogIn className="h-4 w-4" /> Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-cream-200/80 pt-4 text-xs text-charcoal-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="ml-1 font-bold text-terracotta-600 hover:underline"
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>

      {/* Password Reset Modal */}
      <Dialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Password"
        description="Enter your registered email address to receive password reset instructions."
      >
        <form
          onSubmit={handleSubmitReset(onResetSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...registerReset("email")}
            />
            {resetErrors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {resetErrors.email.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isResetting}>
              Send Reset Link
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
