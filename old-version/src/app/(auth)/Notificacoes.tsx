import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  read: boolean | null;
  type: string | null;
  created_at: string | null;
}

export function Notificacoes() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifications(data ?? []);
    setLoading(false);
  }

  async function handleMarkRead(id: string) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  async function handleMarkAllRead() {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => !n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcons: Record<string, string> = {
    quotation: "📦",
    bid: "📋",
    order: "📝",
    tracking: "📡",
    document: "📄",
    payment: "💰",
    review: "⭐",
    system: "🔔",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔔 Notificações</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fique por dentro de tudo que acontece.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "Todas" : `Não lidas (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="mt-8 text-center text-sm text-gray-500">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-4xl">🔔</p>
          <p className="mt-4 text-sm text-gray-500">
            {filter === "unread"
              ? "Nenhuma notificação não lida."
              : "Nenhuma notificação ainda."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                n.read
                  ? "border-gray-100 bg-white"
                  : "border-blue-200 bg-blue-50"
              }`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <span className="text-xl">
                {typeIcons[n.type ?? ""] ?? "🔔"}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium ${
                      n.read ? "text-gray-700" : "text-gray-900"
                    }`}
                  >
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
                {n.body && (
                  <p className="mt-1 text-xs text-gray-500">{n.body}</p>
                )}
                <p className="mt-1 text-[10px] text-gray-400">
                  {new Date(n.created_at ?? "").toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
