import { createFileRoute, Link } from "@tanstack/react-router";
import { InstitutionalShell } from "@/components/InstitutionalShell";
import { AlertTriangle, Layers, Database, Eye, Sparkles, ArrowRight, CheckCircle2, Building2, Scale, Repeat } from "lucide-react";

export const Route = createFileRoute("/por-que")({
  head: () => ({
    meta: [
      { title: "Por que esta plataforma existe? — Parceria Inteligente" },
      { name: "description", content: "O problema público que a Plataforma Parceria Inteligente resolve: governança dispersa, baixa rastreabilidade e perda de conhecimento institucional na gestão de parcerias." },
      { property: "og:title", content: "Por que esta plataforma existe? — Parceria Inteligente" },
      { property: "og:description", content: "De um modelo centrado em documentos para um modelo centrado em dados, evidências e aprendizado institucional." },
    ],
  }),
  component: PorQue,
});

const desafios = [
  { icon: Layers, t: "Informações dispersas", d: "Dados de instrumentos espalhados em planilhas, e-mails, processos e sistemas paralelos sem integração." },
  { icon: AlertTriangle, t: "Controles manuais", d: "Acompanhamento dependente de rotinas pontuais, sem padronização nem trilhas de auditoria nativas." },
  { icon: Eye, t: "Baixa rastreabilidade", d: "Dificuldade de reconstituir decisões, vigências, repasses e responsáveis ao longo do ciclo de vida." },
  { icon: Database, t: "Dificuldade de monitoramento", d: "Sem visão consolidada de riscos, conformidade e desempenho dos instrumentos em execução." },
  { icon: Repeat, t: "Perda de conhecimento", d: "Saída de servidores leva embora contexto, raciocínio e aprendizados que sustentavam a gestão." },
];

const mudancas = [
  { t: "Dados organizados", d: "Cadastro único de instrumentos, parceiros e vigências com qualidade auditável e governança de dados." },
  { t: "Visão integrada", d: "Painéis e relatórios que consolidam ciclo de vida, riscos, monitoramento e resultados em um só lugar." },
  { t: "Gestão baseada em evidências", d: "Decisões apoiadas por indicadores, históricos e fontes verificáveis — não por percepção isolada." },
  { t: "Fiscalização orientada por risco", d: "Esforço de acompanhamento direcionado para os instrumentos com maior necessidade de atenção." },
  { t: "Conhecimento compartilhado", d: "Lições aprendidas, boas práticas e memória institucional preservadas e reutilizáveis." },
];

const valores = [
  { icon: Building2, t: "Eficiência", d: "Menos retrabalho, menos tempo de análise, mais foco no que importa." },
  { icon: Eye, t: "Transparência", d: "Trilhas auditáveis e dados estruturados disponíveis para controle e sociedade." },
  { icon: Repeat, t: "Continuidade administrativa", d: "Conhecimento institucional preservado para além da rotatividade de equipes." },
  { icon: Scale, t: "Fortalecimento institucional", d: "Capacidade de Estado ampliada por meio de governança madura e baseada em dados." },
];

function PorQue() {
  return (
    <InstitutionalShell>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 [background:radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.18),transparent_55%)]" />
        <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-16">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gov-blue">Posicionamento Institucional</div>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] max-w-4xl">
            Por que esta plataforma existe?
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/70 leading-relaxed max-w-3xl">
            A gestão de acordos, convênios e parcerias é uma função essencial do Estado — e, ao mesmo tempo, uma das áreas em que a Administração Pública mais perde tempo, evidências e conhecimento. A Parceria Inteligente nasce para resolver esse problema público.
          </p>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black/20">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <div className="text-[11px] font-bold uppercase tracking-widest text-rose-300">O desafio atual</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 max-w-3xl">
            Uma governança que ainda depende de controles dispersos e conhecimento fragmentado.
          </h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {desafios.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="size-10 rounded-lg bg-rose-500/15 grid place-items-center text-rose-300">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{d.t}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{d.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-6 py-20 grid lg:grid-cols-[1fr_1.2fr] gap-12">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">O que muda com a plataforma</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 leading-tight">
              De documentos isolados para dados, evidências e aprendizado.
            </h2>
            <p className="text-white/60 mt-5 leading-relaxed">
              A plataforma transforma a forma como o Estado conhece, monitora e aprende com suas parcerias — sem substituir as competências dos servidores, mas amplificando sua capacidade de decisão.
            </p>
          </div>
          <ul className="space-y-3">
            {mudancas.map((m) => (
              <li key={m.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-start gap-4">
                <CheckCircle2 className="size-5 mt-0.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-display text-base font-bold">{m.t}</div>
                  <div className="text-sm text-white/60 mt-1 leading-relaxed">{m.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black/20">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gov-blue">Valor para o Estado</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 max-w-3xl">
            Eficiência, transparência, continuidade e fortalecimento institucional.
          </h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {valores.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.t} className="rounded-2xl border border-white/10 bg-gradient-to-br from-gov-blue/10 to-white/[0.02] p-6">
                  <div className="size-10 rounded-lg bg-gov-blue/20 grid place-items-center text-gov-blue">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{v.t}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{v.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1400px] px-6 py-16 flex flex-wrap gap-3">
          <Link to="/inteligencia" className="inline-flex items-center gap-2 rounded-md bg-gov-blue px-5 py-3 text-sm font-semibold hover:bg-blue-500">
            Conheça a Inteligência Institucional <ArrowRight className="size-4" />
          </Link>
          <Link to="/valor-publico" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/10">
            Ver o Valor Público gerado <Sparkles className="size-4" />
          </Link>
        </div>
      </section>
    </InstitutionalShell>
  );
}