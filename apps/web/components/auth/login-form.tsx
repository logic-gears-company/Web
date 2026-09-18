"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Github, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/chat";
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: LoginFormData) {
    setUnverifiedEmail(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      const code = (result as { code?: string }).code ??
        new URLSearchParams(window.location.search).get("code");
      if (code === "email_not_verified") {
        setUnverifiedEmail(data.email);
        return;
      }
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Welcome back");
    router.push(callbackUrl);
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "github") {
    setIsOAuthLoading(provider);
    try { await signIn(provider, { callbackUrl }); }
    finally { setIsOAuthLoading(null); }
  }

  async function handleResendVerification() {
    const email = unverifiedEmail ?? getValues("email");
    if (!email) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        toast.error("Couldn't resend the verification email. Try again shortly.");
        return;
      }
      toast.success("Verification email sent", { description: "Check your inbox." });
    } finally { setIsResending(false); }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => handleOAuth("google")} disabled={!!isOAuthLoading}>
          {isOAuthLoading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}<span className="ml-2">Google</span>
        </Button>
        <Button variant="outline" onClick={() => handleOAuth("github")} disabled={!!isOAuthLoading}>
          {isOAuthLoading === "github" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
          <span className="ml-2">GitHub</span>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><Separator /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" {...register("password")} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        {unverifiedEmail && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex gap-2 items-start">
              <MailCheck className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Confirm <span className="text-foreground font-medium">{unverifiedEmail}</span> before signing in.</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full" disabled={isResending} onClick={handleResendVerification}>
              {isResending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}Resend verification email
            </Button>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline font-medium">Sign up for free</Link></p>
    </div>
  );
}
