import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Wrench } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";

const MAINTENANCE = import.meta.env.VITE_MAINTENANCE_MODE === "true";

export function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { signIn } = useAuthStore();

  const seo = useSeo({
    title: "Login — TradeXa Fretes",
    description:
      "Acesse sua conta na TradeXa Fretes para gerenciar cotações, fretes e transportadoras. Plataforma de fretes online.",
    keywords:
      "login TradeXa, acessar conta, plataforma de fretes, entrar fretes, TradeXa Fretes",
    canonical: "https://www.tradexafretes.com.br/login",
    noIndex: true,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // Redirect if already logged in (only after profile is loaded)
  useEffect(() => {
    if (!authLoading && user) {
      const { profile } = useAuthStore.getState();
      if (profile?.role === "carrier") {
        navigate("/carrier", { replace: true });
      } else if (profile?.role === "shipper") {
        navigate("/shipper", { replace: true });
      }
      // If profile is null, let handleSubmit do the redirect
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.role === "carrier") {
      navigate("/carrier", { replace: true });
    } else if (result.role === "shipper") {
      navigate("/shipper", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  if (authLoading) {
    return (
      <section className="mx-auto flex min-h-screen max-w-md items-center justify-center px-8 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" role="status" aria-live="polite" />
      </section>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      {seo}
      {/* Background decorative circles */}
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#2563eb]/[0.03] blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-slate-200/50 blur-3xl" />

      <div className="w-full max-w-[440px]">
        {/* Header with logo and Criar conta button */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" aria-label="Página inicial TradeXa Fretes">
            <img
              src="/logo-fretes.png"
              alt="TradeXa Fretes"
              width={128}
              height={42}
              className="h-14 w-auto"
              loading="eager"
              fetchPriority="high"
            />
          </Link>
          <Link
            to="/cadastro"
            className="inline-flex items-center rounded-xl border border-[#2563eb] px-4 py-2 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-[#2563eb]/5"
          >
            Criar conta
          </Link>
        </div>

        {/* Main card with fade + y animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 lg:p-10"
        >
          {/* Lock icon box */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563eb]/10">
              <Lock className="h-7 w-7 text-[#2563eb]" />
            </div>
          </div>

          {/* Title and subtitle */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black text-slate-900">
              Bem-vindo de volta
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Error alert */}
          {error && !MAINTENANCE && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Maintenance mode banner */}
          {MAINTENANCE && (
            <div className="mb-6 space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                <div className="mb-3 flex justify-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                    <Wrench className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-amber-800">
                  Plataforma em manutenção
                </h2>
                <p className="mt-1 text-sm text-amber-700">
                  Estamos realizando melhorias na plataforma. Em breve tudo estará de volta ao normal.
                </p>
                <p className="mt-3 text-xs text-amber-500">
                  Agradecemos pela compreensão.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Senha
                </label>
                <Link
                  to="/contato"
                  className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  Esqueceu?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">
                Lembrar-me
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || MAINTENANCE}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-sm font-bold text-white shadow-lg transition-all hover:from-[#1d4ed8] hover:to-[#2563eb] hover:shadow-[#2563eb]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {MAINTENANCE ? (
                "Indisponível"
              ) : loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Ainda não tem conta?{" "}
            <Link
              to="/cadastro"
              className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Cadastre-se
            </Link>
          </p>
        </motion.div>

        {/* Footer back to home link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
