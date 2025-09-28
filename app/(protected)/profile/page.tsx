"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { fileToDataUrl } from "@/lib/files";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setAvatarUrl(user.avatarUrl ?? null);
  }, [user]);

  useEffect(() => {
    if (!status) return;
    const timeout = setTimeout(() => setStatus(null), 3200);
    return () => clearTimeout(timeout);
  }, [status]);

  function initialsFromName(value: string) {
    if (!value) return "AI";
    return value
      .split(" ")
      .map((part) => part.trim()[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image file.");
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setAvatarUrl(dataUrl);
  }

  function removeAvatar() {
    setAvatarUrl(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim()) {
      setStatus("Name and email are required.");
      return;
    }

    setIsSaving(true);
    updateProfile({ name: name.trim(), email: email.trim(), avatarUrl });
    await new Promise((resolve) => setTimeout(resolve, 250));
    setStatus("Profile saved locally.");
    setIsSaving(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="flex flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/80">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${name}'s avatar`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-slate-300">
                {initialsFromName(name)}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-white">
              {name || "Your name"}
            </h2>
            <p className="text-sm text-slate-400">
              {email || "you@example.com"}
            </p>
          </div>
          <div className="flex gap-3">
            <label className="cursor-pointer rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-200">
              Upload avatar
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </label>
            {avatarUrl ? (
              <button
                type="button"
                onClick={removeAvatar}
                className="rounded-xl border border-rose-500/60 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
        <h2 className="mb-6 text-xl font-semibold text-white">
          Profile settings
        </h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Full name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
              placeholder="Jane Doe"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
              placeholder="you@example.com"
            />
          </label>

          {status ? (
            <p className="rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              {status}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isSaving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
