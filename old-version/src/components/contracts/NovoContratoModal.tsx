import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";

const db: any = supabase;

interface Props {
  shipperId: string;
  onClose: () => void;
  onCreated: () => void;
}

const ufs = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO",
  "MA","MT","MS","MG","PA","PB","PR","PE","PI",
  "RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function NovoContratoModal({ shipperId, onClose, onCreated }: Props) {
  const [originCity, setOriginCity] = useState("");
  const [originState, setOriginState] = useState("");
  const [destCity, setDestCity] = useState("");
  const [destState, setDestState] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [volumeM3, setVolumeM3] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [carrierEmail, setCarrierEmail] = useState("");
  const [carrierId, setCarrierId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchCarrier() {
    if (!carrierEmail) return;
    setSearching(true);
    setError("");

    const { data } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("role", "carrier")
      .eq("email", carrierEmail)
      .maybeSingle();

    if (data) {
      setCarrierId(data.id);
      setError(`✅ Transportadora encontrada: ${data.name || data.email}`);
    } else {
      setCarrierId(null);
      setError("❌ Transportadora não encontrada. Verifique o e-mail.");
    }
    setSearching(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!carrierId) {
      setError("Busque uma transportadora primeiro.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: insertError } = await db.from("contracts").insert({
      shipper_id: shipperId,
      carrier_id: carrierId,
      origin_city: originCity,
      origin_state: originState,
      destination_city: destCity,
      destination_state: destState,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      volume_m3: volumeM3 ? parseFloat(volumeM3) : null,
      cargo_description: cargoDescription || null,
      cargo_type: cargoType || null,
      price: parseFloat(price),
      frequency,
      day_of_week: frequency === "weekly" || frequency === "biweekly" ? parseInt(dayOfWeek) : null,
      day_of_month: frequency === "monthly" ? parseInt(dayOfMonth) : null,
      start_date: new Date().toISOString().split("T")[0],
      status: "active",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="mt-8 w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">📋 Novo contrato recorrente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Carrier search */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Transportadora (e-mail)</label>
            <div className="mt-1 flex gap-2">
              <input
                type="email"
                value={carrierEmail}
                onChange={(e) => { setCarrierEmail(e.target.value); setCarrierId(null); }}
                placeholder="transportadora@email.com"
                className="block flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button type="button" onClick={searchCarrier} disabled={searching || !carrierEmail}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60">
                {searching ? "..." : "Buscar"}
              </button>
            </div>
            {error && <p className="mt-1 text-xs text-gray-500">{error}</p>}
          </div>

          {/* Route */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Origem</label>
            </div>
            <input type="text" required value={originCity} onChange={(e) => setOriginCity(e.target.value)}
              placeholder="Cidade" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            <select required value={originState} onChange={(e) => setOriginState(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">UF</option>
              {ufs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Destino</label>
            </div>
            <input type="text" required value={destCity} onChange={(e) => setDestCity(e.target.value)}
              placeholder="Cidade" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            <select required value={destState} onChange={(e) => setDestState(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">UF</option>
              {ufs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          {/* Cargo details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
                placeholder="5000" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Volume (m³)</label>
              <input type="number" step="0.1" value={volumeM3} onChange={(e) => setVolumeM3(e.target.value)}
                placeholder="30" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de carga</label>
              <select value={cargoType} onChange={(e) => setCargoType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="">Geral</option>
                <option value="fracionado">Fracionado</option>
                <option value="lotacao">Lotação</option>
                <option value="perigoso">Perigoso</option>
                <option value="refrigerado">Refrigerado</option>
                <option value="valor">Alto valor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor do frete (R$)</label>
              <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="1500" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Frequência</label>
            <div className="mt-1 flex gap-2">
              {(["weekly", "biweekly", "monthly"] as const).map((f) => (
                <button type="button" key={f} onClick={() => setFrequency(f)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    frequency === f
                      ? "bg-primary text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                  {f === "weekly" ? "Semanal" : f === "biweekly" ? "Quinzenal" : "Mensal"}
                </button>
              ))}
            </div>
          </div>

          {(frequency === "weekly" || frequency === "biweekly") && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Dia da semana</label>
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary">
                {dayNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
              </select>
            </div>
          )}

          {frequency === "monthly" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Dia do mês</label>
              <select value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary">
                {Array.from({ length: 28 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}º</option>
                ))}
              </select>
            </div>
          )}

          {/* Cargo description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição da carga</label>
            <textarea rows={2} value={cargoDescription} onChange={(e) => setCargoDescription(e.target.value)}
              placeholder="Ex: Produtos eletrônicos, caixas de 20kg cada"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !carrierId}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {loading ? "Criando..." : "📋 Criar contrato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
