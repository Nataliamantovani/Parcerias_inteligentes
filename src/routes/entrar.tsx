import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LogIn, ShieldCheck } from "lucide-react";

import { useSessao } from "@/lib/auth/sessao";

export const Route = createFileRoute("/entrar")({
  head: () => ({ meta: [{ title: "Entrar — PNGI" }] }),
  component: EntrarPage,
});

function EntrarPage() {
  const { entrar, sessao, carregando } = useSessao();
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carregando && sessao) navegar({ to: "/conta" });
  }, [carregando, sessao, navegar]);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const falha = await entrar(email.trim(), senha);
    setEnviando(false);
    if (falha) setErro(falha);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gov-navy grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="size-9 rounded-md bg-gov-blue grid place-items-center text-white font-bold text-[10px] uppercase tracking-tighter">
            PNGI
          </div>
          <div className="font-display text-sm font-bold tracking-tight">
            Plataforma Nacional de Governança Inteligente
          </div>
        </Link>

        <form
          onSubmit={aoEnviar}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5"
        >
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Entrar</h1>
            <p className="mt-1 text-sm text-slate-500">Acesso restrito a servidores cadastrados.</p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              E-mail
            </span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-gov-blue focus:outline-none focus:ring-2 focus:ring-gov-blue/20"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Senha
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-gov-blue focus:outline-none focus:ring-2 focus:ring-gov-blue/20"
            />
          </label>

          {erro && (
            <p role="alert" className="text-sm text-rose-600">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando || carregando}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gov-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            <LogIn className="size-4" />
            {enviando ? "Entrando…" : "Entrar"}
          </button>

          <p className="flex gap-2 text-xs text-slate-500">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
            Protótipo com dados fictícios. Na versão institucional, o acesso será pelo gov.br.
          </p>
        </form>
      </div>
    </div>
  );
}
