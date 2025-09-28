"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/profile", label: "Profile" },
];

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-300">
        Loading session…
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/70 bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/20 text-lg font-semibold text-sky-300">
              AI
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-200">AI Chat</p>
              <p className="text-xs text-slate-500">
                Hello, {user?.name ?? "friend"}!
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-300">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 transition ${
                    isActive
                      ? "bg-sky-500/20 text-sky-100 shadow-inner shadow-sky-500/40"
                      : "hover:bg-slate-800/70 hover:text-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-rose-500/60 hover:text-rose-200"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl flex-col px-6 py-6">
        {children}
      </main>
    </div>
  );
}
