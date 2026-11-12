import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldAlert, UserRound } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { ROTULO_PERFIL, useSessao } from "@/lib/auth/sessao";

export const Route = createFileRoute("/conta")({
  head: () => ({ meta: [{ title: "Minha conta — PNGI" }] }),
  component: ContaPage,
});

function ContaPage() {
  const { carregando, sessao, cadastro, sair } = useSessao();
  const navegar = useNavigate();

  async function aoSair() {
    await sair();
    navegar({ to: "/" });
  }

  return (
    <DashboardLayout>
      <header>
        <div className="text-sm font-medium text-gov-blue mb-1">Acesso</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Minha conta</h2>
      </header>

      {carregando ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : !sessao ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm">Você não está conectada.</p>
          <Link
            to="/entrar"
            className="mt-4 inline-flex rounded-lg bg-gov-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Entrar
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-gov-blue/10 grid place-items-center">
                <UserRound className="size-6 text-gov-blue" />
              </div>
              <div>
                <div className="font-semibold">{cadastro?.nome ?? sessao.user.email}</div>
                <div className="text-xs text-slate-500">{sessao.user.email}</div>
              </div>
            </div>

            {cadastro ? (
              <dl className="mt-6 space-y-3 text-sm">
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="text-slate-400">Órgão</dt>
                  <dd className="font-medium">
                    {cadastro.orgao ? `${cadastro.orgao.sigla} — ${cadastro.orgao.nome}` : "—"}
                  </dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="text-slate-400">Perfil</dt>
                  <dd className="font-medium">{ROTULO_PERFIL[cadastro.perfil]}</dd>
                </div>
              </dl>
            ) : (
              <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <ShieldAlert className="size-5 shrink-0" />
                <p>
                  Login realizado, mas esta conta não tem cadastro ativo de servidor. Por segurança,
                  o banco não mostra nenhum dado. Peça ao administrador do seu órgão para
                  cadastrá-la.
                </p>
              </div>
            )}

            <button
              onClick={aoSair}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="size-4" /> Sair
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Como funciona o acesso
            </h3>
            <p>
              O que cada pessoa vê e altera é decidido pelas regras do banco de dados, conforme o
              Modelo de Perfis e Permissões: perfil, órgão e designação em cada instrumento.
            </p>
            <p>
              As demais telas do protótipo continuam demonstrativas. As funcionalidades com dados
              reais serão ligadas a esta sessão nas próximas etapas.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
