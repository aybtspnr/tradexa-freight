import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  signIn: (email: string, password: string) => Promise<{
    error: string | null;
    role: string | null;
  }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: "carrier" | "shipper",
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<Profile | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  reset: () => set({ user: null, profile: null, loading: false }),

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message, role: null };
    }

    // Fetch profile role
    const profile = await get().getProfile();
    const role = profile?.role ?? null;

    return { error: null, role };
  },

  signUp: async (email, password, name, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message, needsEmailConfirmation: false };
    }

    const user = data.user;

    // If user was created, update the profile with name and role
    if (user) {
      // Update the profile that was created by the DB trigger
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? email,
            name,
            role,
          } as never,
          { onConflict: "id" } as never,
        );

      if (profileError) {
        console.error("[authStore] Failed to update profile:", profileError);
      }
    }

    const needsEmailConfirmation =
      data.session === null && data.user?.identities?.length === 0;

    return { error: null, needsEmailConfirmation };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  getProfile: async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .maybeSingle();

    const profile = data as Profile | null;
    if (profile) {
      set({ profile });
    }
    return profile;
  },
}));
