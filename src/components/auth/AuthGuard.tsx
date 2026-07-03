import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { MaintenanceOverlay } from "@/components/maintenance/MaintenanceOverlay";
import type { ReactNode } from "react";

const MAINTENANCE = import.meta.env.VITE_MAINTENANCE_MODE === "true";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: "carrier" | "shipper" | "admin";
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const { profile, getProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && !profile) {
      getProfile();
    }
  }, [user, profile, getProfile]);

  // Maintenance mode — block access for all users
  if (MAINTENANCE) {
    return <MaintenanceOverlay />;
  }

  // Show spinner while loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated — redirect will happen
  if (!user) {
    return null;
  }

  // Check role if required
  if (requiredRole && profile && profile.role !== requiredRole) {
    // Redirect to the correct dashboard based on actual role
    const target = profile.role === "carrier" ? "/carrier" : "/shipper";
    navigate(target, { replace: true });
    return null;
  }

  return <>{children}</>;
}
