import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Perfil() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"shipper" | "carrier" | "admin">("shipper");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
    });
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfileId(data.id);
      setName(data.name ?? "");
      setPhone(data.phone ?? "");
      setRole(data.role ?? "shipper");
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);

    const payload = { name, phone, role };

    if (profileId) {
      await supabase.from("profiles").update(payload).eq("id", user.id);
    } else {
      await supabase.from("profiles").insert({ id: user.id, email: user.email ?? "", ...payload });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Perfil</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Suas informações na plataforma.</p>

      <form onSubmit={handleSave} className="mt-8 space-y-5">
        {saved && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
            Perfil atualizado com sucesso!
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dados pessoais</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-8888"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Tipo de conta</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${role === "shipper" ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"}`}>
              <input
                type="radio"
                name="role"
                value="shipper"
                checked={role === "shipper"}
                onChange={(e) => setRole(e.target.value as "shipper" | "carrier" | "admin")}
                className="sr-only"
              />
              <span className="text-2xl">📦</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Embarcador</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Precisa transportar cargas</p>
              </div>
            </label>
            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${role === "carrier" ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"}`}>
              <input
                type="radio"
                name="role"
                value="carrier"
                checked={role === "carrier"}
                onChange={(e) => setRole(e.target.value as "shipper" | "carrier" | "admin")}
                className="sr-only"
              />
              <span className="text-2xl">🚛</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Transportadora</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Oferece frete</p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </div>
  );
}
