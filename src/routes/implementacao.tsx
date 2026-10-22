import { createFileRoute, Link } from "@tanstack/react-router";
import { InstitutionalShell } from "@/components/InstitutionalShell";
import {
  BookMarked,
  Database,
  BarChart3,
  Brain,
  MessageCircle,
  Network,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";

export const Route = createFileRoute("/implementacao")({
  head: () => ({
    meta: [
      { title: "Implementação Progressiva — PNGI" },
      { name: "description", content: "Roadmap em 6 fases da Plataforma Nacional de Governança Inteligente de Instrumentos de Cooperação." },
    ],
  }),
  component: Implementacao,
});

const phases = [
  {
    n: 1,
    icon: BookMarked,
    title: "Modelo Metodológico Nacional",
    status: "Concluída",
    desc: "Padronização do ciclo de vida dos instrumentos, fases, marcos e critérios. Definição de papéis e responsabilidades, normativos de referência e métricas institucionais.",
    deliverables: ["Metodologia publicada", "Manual de papéis e responsabilidades", "Catálogo de normativos"],
  },
  {
    n: 2,
    icon: Database,
    title: "Cadastro Único e Governança de Dados",
    status: "Em execução",
    desc: "Centralização de instrumentos, parceiros e vigências em um cadastro único com qualidade auditável. Integração com bases federais e governança de dados aderente à LGPD.",
    deliverables: ["Cadastro único de instrumentos", "Cadastro único de parceiros", "Integração CEIS/CNEP/SIORG"],
  },
  {
    n: 3,
    icon: BarChart3,
    title: "Indicadores e Dashboards",
    status: "Em execução",
    desc: "Painéis executivos, gerenciais e operacionais com indicadores de cobertura, conformidade, vigência e desempenho dos instrumentos.",
    deliverables: ["Painel executivo", "Indicadores institucionais", "Alertas automáticos"],
  },
  {
    n: 4,
    icon: Brain,
    title: "Motor Inteligente de Risco",
    status: "Piloto",
    desc: "Indicadores de risco com base em padrões históricos, dados contextuais e informações de integridade e conformidade — para recomendar prioridades de acompanhamento.",
    deliverables: ["Motor de risco", "Auditoria inteligente", "Recomendações de fiscalização"],
  },
  {
    n: 5,
    icon: MessageCircle,
    title: "Assistente Virtual de Governança",
    status: "Piloto",
    desc: "Ideobaldo — assistente especializado em instrumentos de cooperação, legislação, governança, monitoramento e fiscalização, com rastreabilidade de fontes.",
    deliverables: ["Ideobaldo (IA generativa)", "Relatórios inteligentes", "Base de conhecimento institucional"],
  },
  {
    n: 6,
    icon: Network,
    title: "Interoperabilidade Governamental",
    status: "Planejada",
    desc: "Plataforma compartilhada entre órgãos da Administração Pública Brasileira, com APIs públicas, interoperabilidade com sistemas estruturantes e federação de governança.",
    deliverables: ["APIs públicas (gov.br)", "Federação multi-órgão", "Observatório nacional"],
  },
];

const statusStyle: Record<string, string> = {
  Concluída: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  "Em execução": "bg-gov-blue/15 text-blue-300 border-gov-blue/30",
  Piloto: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  Planejada: "bg-white/5 text-white/60 border-white/10",
};

function Implementacao() {
  return (
    <InstitutionalShell>
      <section className="mx-auto max-w-[1400px] px-6 pt-20 pb-12">
        <div className="text-[11px] font-bold uppercase tracking-widest text-gov-blue">Roadmap institucional</div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight max-w-4xl leading-tight">
          Implementação Progressiva em 6 Fases
        </h1>
        <p className="mt-5 text-white/70 max-w-3xl leading-relaxed">
          A PNGI evolui em fases estruturadas que vão da metodologia nacional à interoperabilidade governamental. Cada fase entrega capacidades concretas e consolidadas antes da próxima.
        </p>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24">
        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-gov-blue/60 via-white/10 to-transparent md:left-1/2 md:-translate-x-1/2" />
          <ol className="space-y-10">
            {phases.map((p, idx) => {
              const Icon = p.icon;
              const right = idx % 2 === 1;
              return (
                <li key={p.n} className="relative md:grid md:grid-cols-2 md:gap-12">
                  <div className={"hidden md:block " + (right ? "md:order-2" : "")} />
                  <div className={"relative pl-14 md:pl-0 " + (right ? "md:order-1 md:pr-12 md:text-right" : "md:pl-12")}>
                    <div className={"absolute top-0 size-10 rounded-full border border-white/15 bg-gov-navy grid place-items-center text-gov-blue " + (right ? "left-2 md:left-auto md:right-[-20px]" : "left-2 md:left-[-20px]")}>
                      <Icon className="size-4" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-gov-blue/40 transition-colors">
                      <div className={"flex items-center gap-3 " + (right ? "md:justify-end" : "")}>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Fase {String(p.n).padStart(2, "0")}</span>
                        <span className={"text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border " + statusStyle[p.status]}>
                          {p.status === "Concluída" ? (
                            <CheckCircle2 className="inline size-3 mr-1 -mt-0.5" />
                          ) : (
                            <CircleDashed className="inline size-3 mr-1 -mt-0.5" />
                          )}
                          {p.status}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-bold">{p.title}</h3>
                      <p className="mt-2 text-sm text-white/70 leading-relaxed">{p.desc}</p>
                      <div className={"mt-4 flex flex-wrap gap-2 " + (right ? "md:justify-end" : "")}>
                        {p.deliverables.map((d) => (
                          <span key={d} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-gov-blue/20 to-transparent p-8 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="font-display text-xl font-bold">Pronto para explorar a plataforma em operação?</div>
            <p className="text-sm text-white/70 mt-1">Acesse o painel executivo com dados do piloto SIGACT IA — INSS.</p>
          </div>
          <Link to="/painel" className="inline-flex items-center gap-2 rounded-md bg-gov-blue px-5 py-3 text-sm font-semibold hover:bg-blue-500">
            Acessar Painel Executivo
          </Link>
        </div>
      </section>
    </InstitutionalShell>
  );
}