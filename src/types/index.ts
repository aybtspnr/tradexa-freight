import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/* ─── Re-export generated types for convenience ────────── */

type Schema = Database["freight"];
type Tables = Schema["Tables"];
type Enums = Schema["Enums"];

// --- Profiles ---
export type Profile = Tables["profiles"]["Row"];
export type UserRole = Enums["user_role"];

// --- Auth ---
export type AuthUser = User;

export interface AuthSession {
  user: AuthUser | null;
  loading: boolean;
}

// --- Freight / Orders ---
export type Freight = Tables["orders"]["Row"];

export type FreightStatus =
  | "pending"
  | "quoted"
  | "in_transit"
  | "delivered"
  | "cancelled";

// --- Quotes ---
export type Quote = Tables["quotations"]["Row"];
export type QuoteBid = Tables["quotation_bids"]["Row"];

export type QuoteStatus = "pending" | "accepted" | "rejected";

// --- Fleet ---
export type Fleet = Tables["fleet"]["Row"];

// --- Drivers ---
export type Driver = Tables["drivers"]["Row"];

// --- Routes ---
export type Route = Tables["routes"]["Row"];

// --- Freight Tables ---
export type FreightTable = Tables["freight_tables"]["Row"];

// --- Notifications ---
export type Notification = Tables["notifications"]["Row"];

// --- Contracts ---
export type Contract = Tables["contracts"]["Row"];

// --- Common ---
export type LoadingState = "idle" | "loading" | "succeeded" | "failed";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
