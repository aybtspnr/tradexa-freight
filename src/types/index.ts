import type { User } from "@supabase/supabase-js";

// ─── User / Auth ───────────────────────────────────────────
export type AuthUser = User;

export interface AuthSession {
  user: AuthUser | null;
  loading: boolean;
}

// ─── Freight / Shipping ────────────────────────────────────
export interface Freight {
  id: string;
  origin: string;
  destination: string;
  weight_kg: number;
  volume_m3: number;
  description: string;
  status: FreightStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type FreightStatus =
  | "pending"
  | "quoted"
  | "in_transit"
  | "delivered"
  | "cancelled";

// ─── Quote ─────────────────────────────────────────────────
export interface Quote {
  id: string;
  freight_id: string;
  carrier_id: string;
  amount_cents: number;
  estimated_days: number;
  notes: string | null;
  status: QuoteStatus;
  created_at: string;
}

export type QuoteStatus = "pending" | "accepted" | "rejected";

// ─── Common ────────────────────────────────────────────────
export type LoadingState = "idle" | "loading" | "succeeded" | "failed";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
