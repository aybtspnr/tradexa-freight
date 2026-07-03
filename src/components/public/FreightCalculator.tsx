import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";

const db: any = supabase;

interface RouteResult {
  carrierName: string;
  price: number;
  distanceKm: number | null;
}

export function FreightCalculator() {
  const [originCity, setOriginCity] = useState("");
  const [originState, setOriginState] = useState("");
  const [destCity, setDestCity] = useState("");
  const [destState, setDestState] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [volumeM3, setVolumeM3] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RouteResult[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSimulate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    const { data: routes } = await supabase
      .from("routes")
      .select(`
        distance_km,
        carrier_id,
        profiles!inner(id, name),
        freight_tables!inner(*)
      `)
      .eq("origin_city", originCity)
      .eq("origin_state", originState)
      .eq("destination_city", destCity)
      .eq("destination_state", destState)
      .eq("active", true);

    const calculated: RouteResult[] = [];

    if (routes) {
      for (const route of routes as any[]) {
        const tables = Array.isArray(route.freight_tables)
          ? route.freight_tables
          : [route.freight_tables];

        for (const table of tables) {
          if (!table.active) continue;

          let price = table.min_price ?? 0;
          const w = weightKg ? parseFloat(weightKg) : null;
          const v = volumeM3 ? parseFloat(volumeM3) : null;

          if (table.price_per_kg && w) {
            const byKg = w * table.price_per_kg;
            if (byKg > price) price = byKg;
          }
          if (table.price_per_m3 && v) {
            const byM3 = v * table.price_per_m3;
            if (byM3 > price) price = byM3;
          }
          if (table.price_per_km && route.distance_km) {
            const byKm = route.distance_km * table.price_per_km;
            if (byKm > price) price = byKm;
          }
          if (table.min_price && price < table.min_price) {
            price = table.min_price;
          }

          calculated.push({
            carrierName: route.profiles?.name || "Transportadora",
            price,
            distanceKm: route.distance_km,
          });
        }
      }
    }

    // Sort by price
    calculated.sort((a, b) => a.price - b.price);

    setResults(calculated.slice(0, 5));
    setLoading(false);
  }

  async function handleLeadCapture() {
    if (!email) return;
    // Save lead to Supabase (anon insert)
    await db.from("leads").insert({
      email,
      origin: `${originCity}/${originState}`,
      destination: `${destCity}/${destState}`,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
    });
    alert("✅ Cadastrado! Entraremos em contato.");
    setEmail("");
  }

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const ufs = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
  ];

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
          🚛
        </span>
        <div>
          <h3 className="text-lg font-bold text-text">Simule seu frete agora</h3>
          <p className="text-sm text-text-muted">
            Preço estimado com base nas tabelas das transportadoras
          </p>
        </div>
      </div>

      <form onSubmit={handleSimulate} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Origem */}
          <div>
            <label className="block text-xs font-medium text-text-muted">Cidade de origem</label>
            <input
              type="text"
              required
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              placeholder="São Paulo"
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted">UF</label>
            <select
              required
              value={originState}
              onChange={(e) => setOriginState(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Selecione</option>
              {ufs.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          {/* Destino */}
          <div>
            <label className="block text-xs font-medium text-text-muted">Cidade de destino</label>
            <input
              type="text"
              required
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
              placeholder="Rio de Janeiro"
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted">UF</label>
            <select
              required
              value={destState}
              onChange={(e) => setDestState(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Selecione</option>
              {ufs.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          {/* Peso e volume */}
          <div>
            <label className="block text-xs font-medium text-text-muted">Peso (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="5000"
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted">Volume (m³)</label>
            <input
              type="number"
              step="0.1"
              value={volumeM3}
              onChange={(e) => setVolumeM3(e.target.value)}
              placeholder="30"
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Calculando..." : "🔍 Simular frete"}
        </button>
      </form>

      {/* Results */}
      {searched && !loading && (
        <div className="mt-6">
          {results && results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-text-muted">
                {results.length} transportadora(s) encontrada(s) para {originCity}/{originState} → {destCity}/{destState}
              </p>
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 transition-all hover:border-primary/20"
                >
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-text">
                      {i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""}
                      {r.carrierName}
                    </p>
                    {r.distanceKm && (
                      <p className="text-xs text-text-muted">{r.distanceKm} km</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary">{fmt(r.price)}</p>
                </div>
              ))}

              {/* Lead capture CTA */}
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4">
                <p className="text-sm font-medium text-text">
                  📋 Quer contratar este frete?
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Cadastre-se gratuitamente para comparar, contratar e rastrear fretes.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu melhor e-mail"
                    className="block flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleLeadCapture}
                    disabled={!email}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
                  >
                    Quero!
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-text-muted">
                  🔗 Já tem conta?{" "}
                  <a href="/cadastro" className="text-primary hover:underline">Cadastre-se grátis</a>
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-6 text-center">
              <span className="text-2xl">😕</span>
              <p className="mt-2 text-sm text-text-muted">
                Nenhuma transportadora encontrada para esta rota.
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Tente outras cidades ou cadastre-se para receber notificações quando novas rotas estiverem disponíveis.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FreightCalculator;
