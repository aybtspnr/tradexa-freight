import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// Any-cast helper for new tables not yet in generated types
const db: any = supabase;

// --- Level definitions ---
const LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 300 },
  { level: 4, xpRequired: 700 },
  { level: 5, xpRequired: 1500 },
  { level: 6, xpRequired: 3000 },
] as const;

const MAX_LEVEL = LEVELS[LEVELS.length - 1].level;

// --- Badge definitions ---
export interface BadgeInfo {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const BADGE_DEFINITIONS: Record<string, BadgeInfo> = {
  primeiro_lance: {
    id: "primeiro_lance",
    label: "Primeiro Lance",
    description: "Primeiro lance dado em uma cotação",
    icon: "🎯",
  },
  cinco_estrelas: {
    id: "cinco_estrelas",
    label: "Cinco Estrelas",
    description: "Recebeu uma avaliação 5 estrelas",
    icon: "⭐",
  },
  contratos_top: {
    id: "contratos_top",
    label: "Contratos Top",
    description: "Fechou 5 ou mais contratos",
    icon: "📋",
  },
  perfil_completo: {
    id: "perfil_completo",
    label: "Perfil Completo",
    description: "Completou o perfil da transportadora",
    icon: "✅",
  },
  parceiro_confiavel: {
    id: "parceiro_confiavel",
    label: "Parceiro Confiável",
    description: "Atingiu o nível 4 de confiabilidade",
    icon: "🤝",
  },
};

// --- Interfaces ---
export interface GamificationData {
  carrier_id: string;
  xp: number;
  level: number;
  badges: string[];
  next_level_xp: number;
  current_level_xp: number;
}

export interface GamificationState {
  data: GamificationData | null;
  loading: boolean;
  error: string | null;
}

// --- Pure utility functions ---

/**
 * Returns the level for a given XP amount based on the level table.
 */
export function getLevel(xp: number): number {
  let level = 1;
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) {
      level = l.level;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

/**
 * Returns progress info for the XP bar.
 */
export function getLevelProgress(xp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const level = getLevel(xp);
  if (level >= MAX_LEVEL) {
    return { level, currentXp: xp, nextLevelXp: xp, progressPercent: 100 };
  }

  const currentLevelDef = LEVELS.find((l) => l.level === level)!;
  const nextLevelDef = LEVELS.find((l) => l.level === level + 1)!;

  const currentXp = xp - currentLevelDef.xpRequired;
  const rangeXp = nextLevelDef.xpRequired - currentLevelDef.xpRequired;
  const progressPercent = Math.min(
    100,
    Math.round((currentXp / rangeXp) * 100),
  );

  return {
    level,
    currentXp,
    nextLevelXp: rangeXp,
    progressPercent,
  };
}

/**
 * Returns the badge info objects for a list of badge IDs.
 */
export function getBadgeInfo(badgeIds: string[]): BadgeInfo[] {
  return badgeIds
    .filter((id) => BADGE_DEFINITIONS[id])
    .map((id) => BADGE_DEFINITIONS[id]);
}

// --- Data-fetching hook ---

export function useGamification(carrierId: string | undefined) {
  const [state, setState] = useState<GamificationState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!carrierId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    loadGamification();
  }, [carrierId]);

  async function loadGamification() {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Try RPC first (preferred, returns complete info)
      const { data, error } = await db.rpc("get_carrier_gamification", {
        p_carrier_id: carrierId,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setState({ data: data[0] as GamificationData, loading: false, error: null });
        return;
      }

      // Fallback: read raw from table
      const { data: rawData, error: rawError } = await db
        .from("carrier_gamification")
        .select("*")
        .eq("carrier_id", carrierId)
        .maybeSingle();

      if (rawError) throw rawError;

      if (rawData) {
        const progress = getLevelProgress(rawData.xp);
        setState({
          data: {
            carrier_id: rawData.carrier_id,
            xp: rawData.xp,
            level: rawData.level,
            badges: rawData.badges || [],
            next_level_xp: progress.nextLevelXp,
            current_level_xp: progress.currentXp,
          } as GamificationData,
          loading: false,
          error: null,
        });
      } else {
        // No gamification record yet — return default level 1
        setState({
          data: {
            carrier_id: carrierId,
            xp: 0,
            level: 1,
            badges: [],
            next_level_xp: 100,
            current_level_xp: 0,
          } as GamificationData,
          loading: false,
          error: null,
        });
      }
    } catch (err: any) {
      setState({ data: null, loading: false, error: err?.message || "Erro ao carregar gamificação" });
    }
  }

  /**
   * Adds XP to a carrier and returns updated data.
   */
  async function addXp(
    targetCarrierId: string,
    amount: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await db.rpc("add_xp", {
        p_carrier_id: targetCarrierId,
        p_amount: amount,
      });

      if (error) throw error;

      // Refresh local data after XP addition
      await loadGamification();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Erro ao adicionar XP" };
    }
  }

  /**
   * Fetches the current badges for a carrier.
   */
  async function getBadges(
    targetCarrierId: string,
  ): Promise<BadgeInfo[]> {
    try {
      const { data, error } = await db
        .from("carrier_gamification")
        .select("badges")
        .eq("carrier_id", targetCarrierId)
        .maybeSingle();

      if (error) throw error;

      const badgeIds: string[] = data?.badges || [];
      return getBadgeInfo(badgeIds);
    } catch {
      return [];
    }
  }

  return {
    ...state,
    addXp,
    getBadges,
    getLevel,       // exposed pure function
    getLevelProgress,
    getBadgeInfo,
    refresh: loadGamification,
  };
}
