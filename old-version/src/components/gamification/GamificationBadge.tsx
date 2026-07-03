"use client";

import { useGamification, getBadgeInfo, BADGE_DEFINITIONS, type BadgeInfo } from "@/hooks/useGamification";

interface GamificationBadgeProps {
  carrierId: string | undefined;
  /** If true, shows a compact inline version (default: false) */
  compact?: boolean;
}

/**
 * GamificationBadge — Componente que exibe o nível, barra de progresso de XP
 * e badges conquistados por uma transportadora.
 */
export function GamificationBadge({
  carrierId,
  compact = false,
}: GamificationBadgeProps) {
  const { data, loading, error } = useGamification(carrierId);

  if (!carrierId) {
    return null;
  }

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-3">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="mt-2 h-2 rounded-full bg-gray-200" />
        <div className="mt-2 flex gap-1">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-6 w-6 rounded-full bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const level = data.level;
  const xp = data.xp;
  const nextLevelXp = data.next_level_xp;
  const currentLevelXp = data.current_level_xp;
  const progressPercent =
    level >= 6
      ? 100
      : Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  const badgeIds: string[] = data.badges || [];
  const badges: BadgeInfo[] = getBadgeInfo(badgeIds);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1">
        {/* Level icon */}
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
          {level}
        </span>

        {/* XP text */}
        <span className="text-xs font-medium text-amber-800">
          {xp.toLocaleString("pt-BR")} XP
        </span>

        {/* Mini badges */}
        {badges.length > 0 && (
          <span className="flex -space-x-1">
            {badges.slice(0, 3).map((badge) => (
              <span
                key={badge.id}
                className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] shadow-sm ring-1 ring-amber-200"
                title={badge.label}
              >
                {badge.icon}
              </span>
            ))}
            {badges.length > 3 && (
              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700 shadow-sm ring-1 ring-amber-200">
                +{badges.length - 3}
              </span>
            )}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
      {/* Header: Level + XP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-lg font-bold text-white shadow">
            {level}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Nível {level}
            </p>
            <p className="text-xs text-gray-500">
              {level >= 6
                ? "Nível máximo! 🎉"
                : `${currentLevelXp.toLocaleString("pt-BR")} / ${nextLevelXp.toLocaleString("pt-BR")} XP`}
            </p>
          </div>
        </div>
        <span className="text-sm font-bold text-amber-600">
          {xp.toLocaleString("pt-BR")} XP
        </span>
      </div>

      {/* XP Progress Bar */}
      <div className="mt-3">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Badges Conquistados
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1"
                title={badge.description}
              >
                <span className="text-sm">{badge.icon}</span>
                <span className="text-xs font-medium text-amber-800">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All badges reference (show locked ones as grayed out) */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Todos os Badges
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.values(BADGE_DEFINITIONS).map((badge) => {
            const isUnlocked = badgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-all ${
                  isUnlocked
                    ? "border-amber-200 bg-amber-50"
                    : "border-gray-200 bg-gray-50 opacity-50"
                }`}
                title={isUnlocked ? badge.description : `Trancado: ${badge.description}`}
              >
                <span className={`text-sm ${isUnlocked ? "" : "grayscale"}`}>
                  {badge.icon}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isUnlocked ? "text-amber-800" : "text-gray-400"
                  }`}
                >
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
