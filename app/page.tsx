"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace("/chat");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)] px-6 py-12 text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
        AI Chat App
      </p>
      <h1 className="text-3xl font-semibold text-white">
        Preparing your workspace…
      </h1>
      <p className="max-w-md text-balance text-sm text-slate-400">
        We&apos;ll send you to the chat experience as soon as we know whether
        you&apos;re signed in.
      </p>
    </main>
  );
}
