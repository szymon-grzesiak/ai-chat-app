"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, isLoading, router]);

  const isDisabled = submitting || isLoading;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      await login({ email, password });
      router.replace("/chat");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_60%)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl shadow-sky-950/40 backdrop-blur-xl">
        <div className="mb-8 flex flex-col gap-3 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-sky-400/80">
            Welcome back
          </span>
          <h1 className="text-3xl font-semibold text-white">
            Sign in to AI Chat
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-left text-sm font-medium text-slate-200">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isDisabled}
            />
          </label>

          <label className="flex flex-col gap-2 text-left text-sm font-medium text-slate-200">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isDisabled}
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isDisabled}
            className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-sky-500 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            <span className="absolute inset-0 translate-y-full bg-gradient-to-t from-white/20 to-transparent transition group-hover:translate-y-0" />
            <span className="relative z-10 text-base">
              {submitting ? "Signing in…" : "Sign in"}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
