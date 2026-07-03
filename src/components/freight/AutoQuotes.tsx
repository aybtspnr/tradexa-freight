interface AutoQuotesProps {
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  weightKg: number | null;
  volumeM3: number | null;
  cargoType: string | null;
  quotationId: string;
  userId: string;
  ncmPriceMultiplier?: number;
  ncmCode?: string;
}

/**
 * AutoQuotes — Componente de cotações instantâneas automáticas.
 * Atualmente é um placeholder; a lógica real será implementada posteriormente.
 */
export function AutoQuotes(_props: AutoQuotesProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <p className="text-sm font-medium text-amber-800">
          Cotações instantâneas disponíveis
        </p>
      </div>
      <p className="mt-1 text-xs text-amber-600">
        As transportadoras estão sendo notificadas sobre esta carga.
      </p>
    </div>
  );
}
