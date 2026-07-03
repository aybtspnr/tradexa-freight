import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

const db: any = supabase;

const apiEndpoints = [
  {
    method: "GET",
    path: "/api/v1/quotations",
    desc: "Listar cotações abertas",
    auth: "API Key (header: x-api-key)",
    params: ["status", "origin_city", "destination_city", "page", "limit"],
  },
  {
    method: "POST",
    path: "/api/v1/quotations",
    desc: "Criar nova cotação",
    auth: "API Key",
    body: { origin_city: "string", origin_state: "string", destination_city: "string", destination_state: "string", weight_kg: "number", volume_m3: "number" },
  },
  {
    method: "GET",
    path: "/api/v1/quotations/:id",
    desc: "Detalhes de uma cotação com lances",
    auth: "API Key",
    params: ["id (path)"],
  },
  {
    method: "POST",
    path: "/api/v1/quotations/:id/bids",
    desc: "Enviar lance em uma cotação",
    auth: "API Key",
    body: { price: "number", estimated_days: "number", notes: "string" },
  },
  {
    method: "GET",
    path: "/api/v1/orders",
    desc: "Listar pedidos",
    auth: "API Key",
    params: ["status", "carrier_id", "page", "limit"],
  },
  {
    method: "GET",
    path: "/api/v1/contracts",
    desc: "Listar contratos recorrentes",
    auth: "API Key",
    params: ["status", "carrier_id"],
  },
  {
    method: "POST",
    path: "/api/v1/webhooks",
    desc: "Registrar webhook para eventos",
    auth: "API Key",
    body: { url: "string (https://)", events: "string[]" },
  },
];

const webhookEvents = [
  { id: "quotation.created", desc: "Nova cotação criada", scope: "shipper" },
  { id: "quotation.bid_received", desc: "Lance recebido na cotação", scope: "shipper" },
  { id: "quotation.closed", desc: "Cotação fechada", scope: "shipper + carrier" },
  { id: "order.created", desc: "Novo pedido gerado", scope: "shipper + carrier" },
  { id: "order.status_changed", desc: "Status do pedido alterado", scope: "shipper + carrier" },
  { id: "contract.created", desc: "Contrato recorrente criado", scope: "shipper + carrier" },
  { id: "contract.status_changed", desc: "Status do contrato alterado", scope: "shipper + carrier" },
];

const webhookScopes = [
  { id: "shipper", label: "Embarcador", color: "bg-blue-100 text-blue-800" },
  { id: "carrier", label: "Transportadora", color: "bg-amber-100 text-amber-800" },
  { id: "shipper + carrier", label: "Ambos", color: "bg-green-100 text-green-800" },
];

export function Integracoes() {
  const [activeTab, setActiveTab] = useState<"api" | "webhooks">("api");
  const [selectedScope, setSelectedScope] = useState<string>("all");
  const [apiKey, setApiKey] = useState<string>("");

  async function generateApiKey() {
    const key = `tf_${crypto.randomUUID().replace(/-/g, "")}`;
    const { error } = await db.from("api_keys").insert({
      key,
      name: "ERP Integration",
      active: true,
      user_id: (await supabase.auth.getSession()).data.session?.user?.id,
    });
    if (error) {
      alert("Erro ao gerar chave: " + error.message);
      return;
    }
    setApiKey(key);
  }

  const filteredEvents = selectedScope === "all"
    ? webhookEvents
    : webhookEvents.filter((e) => e.scope.includes(selectedScope));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔗 Integração ERP</h1>
          <p className="mt-1 text-sm text-gray-500">
            API pública e webhooks para integrar o Tradexa Fretes ao seu sistema.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("api")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "api"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📡 API REST
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "webhooks"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🔔 Webhooks
        </button>
      </div>

      {/* API Tab */}
      {activeTab === "api" && (
        <div className="mt-6 space-y-6">
          {/* API Key */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">🔑 Sua chave de API</h3>
            <p className="mt-1 text-xs text-gray-500">
              Gere uma chave para autenticar suas requisições. Envie via header <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">x-api-key</code>.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                placeholder="Clique em Gerar chave..."
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm outline-none"
                onClick={() => { if (apiKey) { navigator.clipboard.writeText(apiKey); alert("✅ Chave copiada!"); } }}
              />
              <button onClick={generateApiKey}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                {apiKey ? "🔄 Regenerar" : "🔑 Gerar chave"}
              </button>
            </div>
            {apiKey && (
              <p className="mt-2 text-xs text-amber-600">
                ⚠️ Guarde esta chave. Ela não será mostrada novamente.
              </p>
            )}
          </div>

          {/* Base URL */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">🌐 URL base</h3>
            <div className="mt-2">
              <code className="rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm text-primary">
                https://fretes.tradexa.com.br/api/v1
              </code>
            </div>
          </div>

          {/* Endpoints */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">📡 Endpoints disponíveis</h3>
            {apiEndpoints.map((ep, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 rounded px-2 py-0.5 font-mono text-xs font-bold ${
                    ep.method === "GET" ? "bg-green-100 text-green-700" :
                    ep.method === "POST" ? "bg-blue-100 text-blue-700" :
                    ep.method === "PUT" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {ep.method}
                  </span>
                  <code className="font-mono text-sm text-gray-900">{ep.path}</code>
                  <span className="text-xs text-gray-400">{ep.auth}</span>
                </div>
                <p className="mt-2 text-xs text-gray-600">{ep.desc}</p>

                {(ep.params || ep.body) && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
                      {ep.params ? "Ver parâmetros" : "Ver body"}
                    </summary>
                    {ep.params && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {ep.params.map((p, j) => (
                          <span key={j} className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    {ep.body && (
                      <pre className="mt-1 rounded bg-gray-50 p-2 text-[10px] text-gray-600 overflow-x-auto">
                        {JSON.stringify(ep.body, null, 2)}
                      </pre>
                    )}
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === "webhooks" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">🔔 Eventos disponíveis</h3>
            <p className="mt-1 text-xs text-gray-500">
              Registre URLs para receber notificações HTTP quando eventos acontecerem na plataforma.
              Enviaremos um POST com JSON no body para sua URL.
            </p>

            {/* Scope filter */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[{ id: "all", label: "Todos", color: "bg-gray-100 text-gray-600" }, ...webhookScopes].map((s) => (
                <button key={s.id} onClick={() => setSelectedScope(s.id)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    selectedScope === s.id ? "bg-primary text-white" : s.color
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Events list */}
            <div className="mt-4 space-y-2">
              {filteredEvents.map((ev) => {
                const scopeColor = webhookScopes.find((s) => s.id === ev.scope)?.color || "bg-gray-100 text-gray-600";
                return (
                  <div key={ev.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div>
                      <code className="font-mono text-xs font-medium text-gray-900">{ev.id}</code>
                      <p className="mt-0.5 text-xs text-gray-500">{ev.desc}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${scopeColor}`}>
                      {ev.scope}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Webhook payload example */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">📦 Exemplo de payload</h3>
            <p className="mt-1 text-xs text-gray-500">Quando um evento é disparado, enviamos um POST para sua URL com este formato:</p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
{`{
  "event": "quotation.created",
  "timestamp": "2026-07-03T14:30:00Z",
  "data": {
    "id": "uuid-da-cotacao",
    "origin_city": "São Paulo",
    "origin_state": "SP",
    "destination_city": "Rio de Janeiro",
    "destination_state": "RJ",
    "weight_kg": 5000,
    "volume_m3": 30,
    "status": "open"
  }
}`}
            </pre>
          </div>

          {/* Integration tips */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900">💡 Dicas de integração</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
              <li>Sua URL deve responder com HTTP 200 em até 5 segundos</li>
              <li>Se falhar, tentamos novamente por até 3 vezes com backoff exponencial</li>
              <li>Use HTTPS obrigatoriamente (HTTP não será aceito)</li>
              <li>Para testar, use serviços como webhook.site ou requestbin.com</li>
              <li>O header <code className="rounded bg-blue-200 px-1 font-mono">x-webhook-signature</code> contém a assinatura HMAC do payload</li>
            </ul>
          </div>

          {/* NCM Integration */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">🏷️</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Integração com NCM Tradexa</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Se você já usa a <strong>Tradexa</strong> para classificação NCM de produtos importados/exportados,
                  a integração é automática. Seus NCMs já classificados aparecem nas cotações de frete,
                  eliminando retrabalho e garantindo compliance regulatório completo.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-600">
                  <li>✅ Classificação NCM automaticamente vinculada ao frete</li>
                  <li>✅ Verificação de compliance (ANTT, ANVISA, Exército, IBAMA)</li>
                  <li>✅ Precificação inteligente baseada no NCM</li>
                  <li>✅ Geração de CT-e com NCM correto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Integracoes;
