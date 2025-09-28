"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type UserProfile = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

type AuthContextValue = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_KEY = "ai-chat-auth";
const PROFILE_KEY = "ai-chat-profile";

const HARD_CODED_EMAIL = "test@example.com";
const HARD_CODED_PASSWORD = "password123";

const DEFAULT_PROFILE: UserProfile = {
  name: "Test User",
  email: HARD_CODED_EMAIL,
  avatarUrl: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLoggedIn = window.localStorage.getItem(AUTH_KEY) === "true";
    if (isLoggedIn) {
      try {
        const savedProfile = window.localStorage.getItem(PROFILE_KEY);
        setUser(savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE);
      } catch (error) {
        console.warn("Could not read profile from storage", error);
        setUser(DEFAULT_PROFILE);
      }
    }

    setIsLoading(false);
  }, []);

  async function login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (email !== HARD_CODED_EMAIL || password !== HARD_CODED_PASSWORD) {
      throw new Error("Invalid credentials. Try the demo email and password.");
    }

    let savedProfile: UserProfile | null = null;
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      if (raw) {
        try {
          savedProfile = JSON.parse(raw) as UserProfile;
        } catch (error) {
          console.warn("Stored profile was corrupt, using defaults", error);
        }
      }
    }

    const profile = { ...(savedProfile ?? user ?? DEFAULT_PROFILE), email };
    setUser(profile);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_KEY, "true");
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
  }

  function logout() {
    setUser(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY);
    }
  }

  function updateProfile(updates: Partial<UserProfile>) {
    setUser((previous) => {
      const nextProfile = { ...(previous ?? DEFAULT_PROFILE), ...updates };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_KEY, "true");
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
      }

      return nextProfile;
    });
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthProvider is missing.");
  }
  return context;
}
