export interface NcmInfo {
  ncm_code: string;
  description: string | null;
  risk_level: "low" | "medium" | "high" | "critical" | null;
  value_density_factor: number;
  requires_antt: boolean;
  requires_anvisa: boolean;
  requires_exercito: boolean;
  requires_ibama: boolean;
  requires_escort: boolean;
  requires_tracking: boolean;
  requires_insurance: boolean;
}

export function formatNcmCode(code: string): string {
  // Format as XXXX.XX.XX (NCM standard)
  const cleaned = code.replace(/\D/g, "");
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 4)}.${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)}.${cleaned.slice(4, 6)}.${cleaned.slice(6, 8)}`;
}
