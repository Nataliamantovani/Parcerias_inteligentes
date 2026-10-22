import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type NavItem = { label: string; to: string; hash?: string };
type NavGroup = { label: string; to: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Governança",
    to: "/governanca",
    items: [
      { label: "Metodologia", to: "/governanca" },
      { label: "Ciclo de Vida", to: "/governanca", hash: "ciclo" },
      { label: "Papéis e Responsabilidades", to: "/governanca", hash: "papeis" },
      { label: "Normativos", to: "/governanca", hash: "normativos" },
    ],
  },
  {
    label: "Instrumentos",
    to: "/instrumentos",
    items: [
      { label: "Cadastro Único", to: "/instrumentos" },
      { label: "Parceiros", to: "/parceiros" },
      { label: "Instrumentos", to: "/instrumentos" },
      { label: "Vigências", to: "/instrumentos" },
    ],
  },
  {
    label: "Governança, Riscos e Integridade",
    to: "/risco",
    items: [
      { label: "Indicadores de Risco", to: "/risco" },
      { label: "Conformidade", to: "/risco" },
      { label: "Histórico Sancionador", to: "/parceiros" },
      { label: "Recomendações de Acompanhamento", to: "/risco" },
    ],
  },
  {
    label: "Monitoramento e Fiscalização",
    to: "/monitoramento",
    items: [
      { label: "Monitoramento", to: "/monitoramento" },
      { label: "Fiscalizações", to: "/monitoramento", hash: "fiscalizacoes" },
      { label: "Evidências", to: "/monitoramento", hash: "evidencias" },
      { label: "Medidas Corretivas", to: "/monitoramento", hash: "medidas" },
    ],
  },
  {
    label: "Inteligência Institucional",
    to: "/inteligencia",
    items: [
      { label: "Lições Aprendidas", to: "/inteligencia" },
      { label: "Boas Práticas", to: "/inteligencia", hash: "boas-praticas" },
      { label: "Casos de Sucesso", to: "/inteligencia", hash: "casos" },
      { label: "Recomendações Institucionais", to: "/inteligencia", hash: "recomendacoes" },
      { label: "Memória Institucional", to: "/inteligencia", hash: "memoria" },
      { label: "Base de Conhecimento", to: "/inteligencia", hash: "base" },
    ],
  },
  {
    label: "Valor Público",
    to: "/valor-publico",
    items: [
      { label: "Benefícios Gerados", to: "/valor-publico" },
      { label: "Indicadores de Resultado", to: "/valor-publico", hash: "indicadores" },
      { label: "Economia e Eficiência", to: "/valor-publico", hash: "economia" },
      { label: "Transparência", to: "/valor-publico", hash: "transparencia" },
      { label: "Capacidade Institucional", to: "/valor-publico", hash: "capacidade" },
    ],
  },
  {
    label: "Painel Executivo",
    to: "/painel",
    items: [
      { label: "Indicadores", to: "/painel" },
      { label: "Alertas", to: "/painel" },
      { label: "Instrumentos Prioritários", to: "/painel", hash: "prioritarios" },
      { label: "Resultados", to: "/painel", hash: "resultados" },
    ],
  },
  {
    label: "IA de Apoio",
    to: "/ideobaldo",
    items: [
      { label: "Assistente Ideobaldo", to: "/ideobaldo" },
      { label: "Motor de Risco", to: "/risco" },
      { label: "Auditoria Inteligente", to: "/auditoria" },
      { label: "Relatórios Inteligentes", to: "/ideobaldo", hash: "relatorios" },
    ],
  },
];

export function TopNav({ variant = "institutional" }: { variant?: "institutional" | "app" }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onDark = variant === "institutional";

  return (
    <nav
      className={
        "sticky top-0 z-50 border-b backdrop-blur-md " +
        (onDark
          ? "border-white/10 bg-gov-navy/85 text-white"
          : "border-slate-200 bg-white/85 text-gov-navy")
      }
    >
      <div className="mx-auto max-w-[1400px] flex h-16 items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="size-9 rounded-md bg-gov-blue grid place-items-center text-white font-bold text-[10px] uppercase tracking-tighter">
            PNGI
          </div>
          <div className="leading-tight">
            <div className={"text-[10px] font-semibold uppercase tracking-widest " + (onDark ? "text-white/60" : "text-slate-400")}>
              Governo Digital · República Federativa do Brasil
            </div>
            <div className="font-display text-sm font-bold tracking-tight">
              Plataforma Nacional de Governança Inteligente
            </div>
          </div>
        </Link>

        <div className="ml-auto hidden xl:flex items-center gap-1">
          {navGroups.map((g, i) => {
            const active = pathname === g.to || pathname.startsWith(g.to + "/");
            return (
              <div
                key={g.label}
                className="relative"
                onMouseEnter={() => setOpenIdx(i)}
                onMouseLeave={() => setOpenIdx(null)}
              >
                <Link
                  to={g.to}
                  className={
                    "flex items-center gap-1 px-3 py-2 rounded-md text-xs font-semibold transition-colors " +
                    (active
                      ? onDark
                        ? "bg-white/10 text-white"
                        : "bg-gov-blue/10 text-gov-blue"
                      : onDark
                        ? "text-white/80 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-gov-navy hover:bg-slate-100")
                  }
                >
                  {g.label}
                  <ChevronDown className="size-3 opacity-60" />
                </Link>
                {openIdx === i && (
                  <div className="absolute top-full left-0 pt-1 w-64 z-50">
                    <div className="rounded-xl border border-slate-200 bg-white shadow-2xl py-2">
                      {g.items.map((it) => (
                        <Link
                          key={it.label}
                          to={it.to}
                          hash={it.hash}
                          className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-gov-blue"
                        >
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Link
          to="/painel"
          className={
            "ml-auto xl:ml-2 hidden md:inline-flex items-center px-3 py-2 rounded-md text-xs font-semibold transition-colors " +
            (onDark
              ? "bg-white text-gov-navy hover:bg-slate-100"
              : "bg-gov-navy text-white hover:bg-slate-800")
          }
        >
          Acessar Painel
        </Link>
      </div>
    </nav>
  );
}

export function InstitutionalShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gov-navy text-white font-sans">
      <TopNav variant="institutional" />
      {children}
      <footer className="border-t border-white/10 mt-24">
        <div className="mx-auto max-w-[1400px] px-6 py-10 grid md:grid-cols-3 gap-8 text-xs text-white/60">
          <div>
            <div className="text-white font-display font-bold mb-2">Plataforma Nacional de Governança Inteligente</div>
            <p className="leading-relaxed">
              Infraestrutura digital reutilizável para a gestão de acordos, convênios e parcerias na Administração Pública Brasileira.
            </p>
          </div>
          <div>
            <div className="text-white font-semibold mb-2">Caso Piloto</div>
            <p className="leading-relaxed">
              SIGACT IA — Sistema Inteligente de Governança de Acordos de Cooperação Técnica · Instituto Nacional do Seguro Social (INSS).
            </p>
          </div>
          <div>
            <div className="text-white font-semibold mb-2">Conformidade</div>
            <p className="leading-relaxed">
              Aderente ao Decreto 11.531/2023, LGPD, Lei 13.019/2014 e diretrizes da Estratégia Federal de Governo Digital.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}