import { Link } from "react-router-dom";

export function Cadastro() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-16">
      <div className="w-full">
        <h1 className="text-center text-3xl font-bold text-text">
          Criar conta
        </h1>
        <p className="mt-2 text-center text-sm text-text-muted">
          Junte-se à TradeXa Fretes
        </p>

        <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-text">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                placeholder="João"
                className="mt-1 block w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="sobrenome" className="block text-sm font-medium text-text">
                Sobrenome
              </label>
              <input
                id="sobrenome"
                type="text"
                placeholder="Silva"
                className="mt-1 block w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="mt-1 block w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            Criar conta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-primary no-underline hover:text-primary-dark">
            Entrar
          </Link>
        </p>
      </div>
    </section>
  );
}
