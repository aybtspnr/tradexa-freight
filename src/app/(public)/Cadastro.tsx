import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import {
  Building2,
  Truck,
  Package,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export function Cadastro() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { signUp } = useAuthStore();

  const seo = useSeo({
    title: "Cadastro — TradeXa Fretes",
    description:
      "Crie sua conta gratuita na TradeXa Fretes em menos de 2 minutos. Conecte-se a transportadoras verificadas e comece a cotar fretes online.",
    keywords:
      "cadastro frete, criar conta, plataforma de fretes, cadastro transportadora, TradeXa Fretes, fretes grátis",
    canonical: "https://www.tradexafretes.com.br/cadastro",
    noIndex: true,
  });

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"carrier" | "shipper">("carrier");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!nome.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError("Aceite os termos de uso e política de privacidade.");
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, nome.trim(), role);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccessMessage(
        "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de fazer login.",
      );
    } else {
      setSuccessMessage("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    }

    setLoading(false);
  };

  const getPasswordStrength = () => {
    const len = password.length;
    if (len === 0) return { width: "0%", color: "bg-slate-200" };
    if (len < 4) return { width: "25%", color: "bg-red-500" };
    if (len < 6) return { width: "50%", color: "bg-yellow-500" };
    if (len < 8) return { width: "75%", color: "bg-blue-400" };
    return { width: "100%", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  if (authLoading) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-8 py-16" role="status" aria-live="polite">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
      </section>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {seo}
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-50/60 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-blue-50/30 blur-2xl" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="Página inicial TradeXa Fretes">
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
          to="/login"
          className="rounded-lg border border-[#e2e8f0] bg-white px-5 py-2 text-sm font-medium text-[#0f172a] no-underline shadow-sm transition-colors hover:bg-slate-50"
        >
          Entrar
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[440px] flex-col items-center justify-center px-4 pb-12 pt-4">
        <div className="w-full">
          {/* White card */}
          <div className="rounded-2xl bg-white p-8 shadow-lg shadow-slate-200/60">
            {/* Icon box */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Building2 className="h-7 w-7 text-[#2563eb]" />
            </div>

            {/* Title */}
            <div className="mt-4 text-center">
              <h1 className="text-2xl font-bold text-[#0f172a]">
                Criar conta
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Comece sua jornada no TradeXa Fretes
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Account type toggle */}
              <div className="rounded-xl border border-[#e2e8f0] bg-slate-50/80 p-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("carrier")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      role === "carrier"
                        ? "border bg-white text-[#2563eb] shadow-sm"
                        : "border-transparent text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                    Transportadora
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("shipper")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      role === "shipper"
                        ? "border bg-white text-[#2563eb] shadow-sm"
                        : "border-transparent text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                    Cliente
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  required
                  className="h-12 w-full rounded-xl border-2 border-[#e2e8f0] bg-white pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  required
                  className="h-12 w-full rounded-xl border-2 border-[#e2e8f0] bg-white pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha segura"
                  required
                  minLength={6}
                  className="h-12 w-full rounded-xl border-2 border-[#e2e8f0] bg-white pl-10 pr-12 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
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

              {/* Password strength bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-200">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>

              {/* Terms checkbox */}
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563eb] accent-[#2563eb] focus:ring-[#2563eb]"
                />
                <span>
                  Aceito os{" "}
                  <Link
                    to="/termos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]"
                  >
                    termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link
                    to="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]"
                  >
                    politica de privacidade
                  </Link>
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className="w-full rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-[#1d4ed8] hover:to-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="font-medium text-[#2563eb] no-underline hover:text-[#1d4ed8]"
              >
                Entrar
              </Link>
            </p>
          </div>

          {/* Footer back link */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 no-underline transition-colors hover:text-[#2563eb]"
            >
              <svg
              className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
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
    </div>
  );
}
