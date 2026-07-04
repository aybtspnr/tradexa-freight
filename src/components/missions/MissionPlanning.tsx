import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import { formatCurrency, formatDate } from "@/utils/format";
import { Package, MapPin, Truck, Plus, Calendar, ChevronRight, DollarSign, Clock, CheckCircle2, AlertCircle, TrendingDown, Route, Search } from "lucide-react";

type Role = "carrier" | "shipper";
type Tab = "todas" | "ativas" | "concluidas";

interface Mission {
  id: string;
  type: "quotation" | "order";
  origem: string;
  destino: string;
  orig_city: string; orig_state: string;
  dest_city: string; dest_state: string;
  data: string;
  valor: number;
  status: string;
  peso: string;
  volume: string;
  desc: string;
  cargo: string;
  bid_count?: number;
}

function missionStatus(s: string) {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    open:      { label: "Aberta",      color: "bg-blue-100 text-blue-800 border-blue-200",     icon: "📋" },
    bidding:   { label: "Com Ofertas", color: "bg-amber-100 text-amber-800 border-amber-200",  icon: "💰" },
    closed:    { label: "Fechada",     color: "bg-slate-100 text-slate-800 border-slate-200",  icon: "✅" },
    cancelled: { label: "Cancelada",   color: "bg-red-100 text-red-800 border-red-200",        icon: "❌" },
    pending:   { label: "Pendente",    color: "bg-amber-100 text-amber-800 border-amber-200",  icon: "⏳" },
    confirmed: { label: "Confirmado",  color: "bg-blue-100 text-blue-800 border-blue-200",     icon: "📝" },
    picked_up: { label: "Coletado",    color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: "📦" },
    in_transit:{ label: "Em Trânsito", color: "bg-purple-100 text-purple-800 border-purple-200", icon: "🚛" },
    delivered: { label: "Entregue",    color: "bg-green-100 text-green-800 border-green-200",  icon: "🏁" },
  };
  return map[s] || { label: s, color: "bg-gray-100 text-gray-800 border-gray-200", icon: "•" };
}

export function MissionPlanning({ role }: { role: Role }) {
  const navigate = useNavigate();
  const p = role === "carrier" ? "/carrier" : "/shipper";
  const userId = useRef<string | null>(null);

  useSeo({ title: "Missões — TradeXa Fretes", description: "Planejamento e acompanhamento de missões de frete.", noIndex: true });

  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("todas");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!userId.current) {
      const { data } = await supabase.auth.getUser();
      userId.current = data?.user?.id || null;
      if (!userId.current) { setLoading(false); return; }
    }
    const uid = userId.current!;
    setLoading(true);

    try {
      if (role === "shipper") {
        const [qRes, oRes] = await Promise.all([
          supabase.from("quotations").select("*").eq("shipper_id", uid).order("created_at", { ascending: false }).limit(50),
          supabase.from("orders").select("*, quotation:quotation_id(*)").eq("shipper_id", uid).order("created_at", { ascending: false }).limit(50),
        ]);
        const list: Mission[] = [];
        ((qRes.data || []) as any[]).forEach((r: any) => {
          list.push({
            id: r.id, type: "quotation",
            origem: `${r.origin_city || "?"}, ${r.origin_state || ""}`, destino: `${r.destination_city || "?"}, ${r.destination_state || ""}`,
            orig_city: r.origin_city || "", orig_state: r.origin_state || "",
            dest_city: r.destination_city || "", dest_state: r.destination_state || "",
            data: r.created_at || "", valor: 0, status: r.status || "open",
            peso: r.weight_kg ? `${r.weight_kg}kg` : "", volume: r.volume_m3 ? `${r.volume_m3}m³` : "",
            desc: r.cargo_description || "", cargo: r.cargo_type || "",
            bid_count: r.status === "bidding" ? (r as any).bid_count || 0 : 0,
          });
        });
        ((oRes.data || []) as any[]).forEach((r: any) => {
          const q = r.quotation || {};
          list.push({
            id: r.id, type: "order",
            origem: `${q.origin_city || "?"}, ${q.origin_state || ""}`, destino: `${q.destination_city || "?"}, ${q.destination_state || ""}`,
            orig_city: q.origin_city || "", orig_state: q.origin_state || "",
            dest_city: q.destination_city || "", dest_state: q.destination_state || "",
            data: r.created_at || "", valor: r.price || 0, status: r.status || "pending",
            peso: q.weight_kg ? `${q.weight_kg}kg` : "", volume: q.volume_m3 ? `${q.volume_m3}m³` : "",
            desc: q.cargo_description || "", cargo: q.cargo_type || "",
          });
        });
        setMissions(list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      } else {
        const [oRes, qRes] = await Promise.all([
          supabase.from("orders").select("*, quotation:quotation_id(*)").eq("carrier_id", uid).order("created_at", { ascending: false }).limit(50),
          supabase.from("quotations").select("*").neq("shipper_id", uid).in("status", ["open", "bidding"]).order("created_at", { ascending: false }).limit(50),
        ]);
        const list: Mission[] = [];
        ((oRes.data || []) as any[]).forEach((r: any) => {
          const q = r.quotation || {};
          list.push({
            id: r.id, type: "order",
            origem: `${q.origin_city || "?"}, ${q.origin_state || ""}`, destino: `${q.destination_city || "?"}, ${q.destination_state || ""}`,
            orig_city: q.origin_city || "", orig_state: q.origin_state || "",
            dest_city: q.destination_city || "", dest_state: q.destination_state || "",
            data: r.created_at || "", valor: r.price || 0, status: r.status || "pending",
            peso: q.weight_kg ? `${q.weight_kg}kg` : "", volume: q.volume_m3 ? `${q.volume_m3}m³` : "",
            desc: q.cargo_description || "", cargo: q.cargo_type || "",
          });
        });
        ((qRes.data || []) as any[]).forEach((r: any) => {
          list.push({
            id: r.id, type: "quotation",
            origem: `${r.origin_city || "?"}, ${r.origin_state || ""}`, destino: `${r.destination_city || "?"}, ${r.destination_state || ""}`,
            orig_city: r.origin_city || "", orig_state: r.origin_state || "",
            dest_city: r.destination_city || "", dest_state: r.destination_state || "",
            data: r.created_at || "", valor: 0, status: r.status || "open",
            peso: r.weight_kg ? `${r.weight_kg}kg` : "", volume: r.volume_m3 ? `${r.volume_m3}m³` : "",
            desc: r.cargo_description || "", cargo: r.cargo_type || "",
          });
        });
        setMissions(list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [role]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let items = missions;
    if (tab === "ativas") items = items.filter(m => ["open", "bidding", "pending", "confirmed", "picked_up", "in_transit"].includes(m.status));
    if (tab === "concluidas") items = items.filter(m => ["closed", "delivered", "cancelled"].includes(m.status));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(m =>
        m.origem.toLowerCase().includes(q) || m.destino.toLowerCase().includes(q) ||
        m.cargo.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
      );
    }
    return items;
  }, [missions, tab, search]);

  const stats = useMemo(() => ({
    pendentes: missions.filter(m => ["open", "bidding", "pending"].includes(m.status)).length,
    em_andamento: missions.filter(m => ["confirmed", "picked_up", "in_transit"].includes(m.status)).length,
    concluidas: missions.filter(m => ["closed", "delivered"].includes(m.status)).length,
    faturamento: missions.filter(m => m.type === "order" && m.status === "delivered").reduce((s, m) => s + m.valor, 0),
    valor_pendente: missions.filter(m => m.type === "order" && m.status === "pending").reduce((s, m) => s + m.valor, 0),
  }), [missions]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {role === "carrier" ? "Missões" : "Minhas Missões"}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {missions.length > 0
              ? `${stats.pendentes} pendente${stats.pendentes !== 1 ? "s" : ""} • ${stats.em_andamento} em andamento`
              : "Nenhuma missão ativa"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load()}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            🔄 Atualizar
          </button>
          {role === "shipper" && (
            <button onClick={() => navigate(`${p}/cotar`)}
              className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors">
              <Plus className="h-4 w-4" /> Nova Cotação
            </button>
          )}
        </div>
      </div>

      {/* ── STATS CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {[
          { icon: AlertCircle, label: "Pendentes",   val: stats.pendentes,   color: "text-amber-600", bg: "bg-amber-50",    border: "border-amber-200" },
          { icon: Clock,        label: "Em Progresso", val: stats.em_andamento, color: "text-blue-600",  bg: "bg-blue-50",    border: "border-blue-200" },
          { icon: CheckCircle2, label: "Concluídas",  val: stats.concluidas,  color: "text-green-600", bg: "bg-green-50",   border: "border-green-200" },
          { icon: DollarSign,   label: "Faturamento", val: formatCurrency(stats.faturamento), color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", isCurrency: true },
          { icon: TrendingDown, label: "A Receber",   val: formatCurrency(stats.valor_pendente), color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", isCurrency: true },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4 transition-all hover:shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color} ${(s as any).isCurrency ? "text-lg" : ""}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* ── TABS + SEARCH ────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {[
            { id: "todas" as Tab, label: "Todas" },
            { id: "ativas" as Tab, label: "Ativas" },
            { id: "concluidas" as Tab, label: "Concluídas" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar missão..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 sm:w-64" />
        </div>
      </div>

      {/* ── MISSION TIMELINE ─────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Truck className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma missão encontrada</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              {role === "shipper"
                ? "Publique sua primeira cotação e as transportadoras começarão a enviar ofertas."
                : "Navegue pelas cotações disponíveis e envie sua primeira oferta."}
            </p>
            <button onClick={() => navigate(`${p}/${role === "shipper" ? "cotar" : "cotacoes"}`)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors">
              <Plus className="h-4 w-4" />
              {role === "shipper" ? "Criar Cotação" : "Ver Cotações"}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((m, idx) => {
              const st = missionStatus(m.status);
              const isQuotation = m.type === "quotation";
              const isOrder = m.type === "order";
              return (
                <div key={m.id} onClick={() => navigate(`${p}/${isQuotation ? "cotacoes" : "fretes"}`)}
                  className="group flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50 sm:px-6">
                  {/* Left: status dot + route line */}
                  <div className="flex flex-col items-center pt-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${st.color}`}>
                      <span className="text-lg leading-none">{st.icon}</span>
                    </div>
                    {idx < filtered.length - 1 && (
                      <div className={`mt-0.5 h-6 w-0.5 ${tab === "concluidas" ? "bg-green-200" : "bg-gray-200"}`} />
                    )}
                  </div>

                  {/* Center: content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">
                        <span className="truncate">{m.origem}</span>
                        <span className="mx-1.5 text-gray-300">→</span>
                        <span className="truncate">{m.destino}</span>
                      </h3>
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${st.color}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* Details row */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      {m.cargo && <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" />{m.cargo}</span>}
                      {m.peso && <span>{m.peso}</span>}
                      {m.volume && <span>{m.volume}</span>}
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(m.data)}</span>
                      {isQuotation && m.bid_count !== undefined && m.bid_count > 0 && (
                        <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                          <DollarSign className="h-3 w-3" />{m.bid_count} oferta{m.bid_count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {m.desc && (
                      <p className="mt-1 line-clamp-1 text-xs text-gray-400">{m.desc}</p>
                    )}

                    {/* Value + action for orders */}
                    {isOrder && m.valor > 0 && (
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-sm font-semibold text-green-700">{formatCurrency(m.valor)}</span>
                        {["pending", "confirmed"].includes(m.status) && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            ⏳ Aguardando início
                          </span>
                        )}
                        {m.status === "in_transit" && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                            🚛 Em rota
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: chevron */}
                  <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ─────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickCard icon={Package} label="Cotações" desc={role === "shipper" ? "Ver minhas cotações e ofertas" : "Ver cotações disponíveis"}
          color="bg-blue-50 text-blue-600" onClick={() => navigate(`${p}/cotacoes`)} />
        <QuickCard icon={Truck} label="Fretes" desc="Acompanhar fretes e entregas"
          color="bg-green-50 text-green-600" onClick={() => navigate(`${p}/fretes`)} />
        {role === "shipper" && (
          <QuickCard icon={Plus} label="Nova Cotação" desc="Solicitar orçamento de frete"
            color="bg-amber-50 text-amber-600" onClick={() => navigate(`${p}/cotar`)} />
        )}
        {role === "carrier" && (
          <>
            <QuickCard icon={MapPin} label="Rotas" desc="Gerenciar rotas e fretes"
              color="bg-indigo-50 text-indigo-600" onClick={() => navigate(`${p}/rotas`)} />
            <QuickCard icon={Route} label="Minha Frota" desc="Veículos e motoristas"
              color="bg-pink-50 text-pink-600" onClick={() => navigate(`${p}/frota`)} />
          </>
        )}
      </div>
    </div>
  );
}

function QuickCard({ icon: Icon, label, desc, color, onClick }: {
  icon: React.ElementType; label: string; desc: string; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </button>
  );
}
