import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { user, loading, setUser, setLoading, getProfile } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        // Fetch profile when user changes — await so loading stays true until profile is ready
        await getProfile();
      } else {
        useAuthStore.setState({ profile: null });
      }

      if (!cancelled) {
        setLoading(false);
      }
    });

    // Bootstrap the session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        await getProfile();
      }

      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, loading };
}
