import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TrendingUp, Clock, Eye, Shield, BookOpen, Building2, Users, Award } from "lucide-react";

export const Route = createFileRoute("/valor-publico")({
  head: () => ({
    meta: [
      { title: "Valor Público — Parceria Inteligente" },
      { name: "description", content: "Benefícios produzidos pela plataforma para gestores, órgãos de controle, parceiros e cidadãos." },
    ],
  }),
  component: Page,
});

const indicadores = [
  { icon: Clock, l: "Redução de tempo de análise", v: "-62%", d: "Comparado ao ciclo manual anterior à plataforma." },
  { icon: TrendingUp, l: "Redução de retrabalho", v: "-48%", d: "Padronização e dados estruturados eliminam etapas duplicadas." },
  { icon: Building2, l: "Instrumentos monitorados", v: "1.248", d: "Em tempo real, com trilhas auditáveis." },
  { icon: Shield, l: "Recomendações emitidas", v: "327", d: "Encaminhadas para acompanhamento e diligência preventiva." },
  { icon: BookOpen, l: "Lições aprendidas registradas", v: "86", d: "Conhecimento institucional preservado e reutilizável." },
  { icon: Eye, l: "Fiscalizações apoiadas", v: "214", d: "Orientadas por risco e evidências." },
  { icon: Award, l: "Boas práticas catalogadas", v: "42", d: "Replicáveis entre órgãos e instrumentos." },
  { icon: Users, l: "Conhecimento preservado", v: "94%", d: "Índice de continuidade após rotatividade de equipes." },
];

const beneficios = [
  { p: "Gestores", t: "Tomada de decisão apoiada por dados, alertas e recomendações contextualizadas." },
  { p: "Órgãos de controle", t: "Trilhas auditáveis, conformidade rastreável e acesso estruturado a evidências." },
  { p: "Parceiros", t: "Clareza sobre obrigações, prazos e critérios — relação mais previsível com o Estado." },
  { p: "Cidadãos", t: "Transparência ampliada e melhor uso dos recursos públicos aplicados em parcerias." },
];

function Page() {
  return (
    <DashboardLayout>
      <header>
        <div className="text-xs font-bold uppercase tracking-widest text-gov-blue mb-2">Resultados Institucionais</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Valor Público</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Os benefícios produzidos pela plataforma para gestores, órgãos de controle, parceiros e a sociedade — medidos em eficiência, transparência e capacidade institucional.
        </p>
      </header>

      <section id="indicadores" className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicadores.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.l} className="p-5 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-gov-blue"><Icon className="size-4" /></span>{i.l}
              </div>
              <div className="font-display text-3xl font-bold mt-2 text-gov-navy">{i.v}</div>
              <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">{i.d}</div>
            </div>
          );
        })}
      </section>

      <section id="economia" className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-gov-navy to-blue-900 text-white">
          <div className="text-[11px] font-bold uppercase tracking-widest text-white/60">Economia e Eficiência</div>
          <h3 className="font-display text-2xl font-bold mt-2">
            A cada ciclo, mais decisões orientadas por evidências — com menos esforço operacional.
          </h3>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              { k: "R$ 18,4 Mi", l: "Estimativa de economia anual em retrabalho evitado" },
              { k: "9.200 h", l: "Horas-servidor liberadas por ano" },
              { k: "+38%", l: "Aumento de cobertura de monitoramento" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-display text-2xl font-bold">{s.k}</div>
                <div className="text-[11px] text-white/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div id="transparencia" className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Transparência</div>
          <h4 className="font-display text-lg font-bold mt-2">Evidências disponíveis para controle</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>· 100% dos atos com trilha de auditoria</li>
            <li>· Dados estruturados conformes à LGPD</li>
            <li>· Integração com bases federais</li>
            <li>· Publicação de indicadores institucionais</li>
          </ul>
        </div>
      </section>

      <section id="capacidade" className="p-8 rounded-2xl bg-white border border-slate-200">
        <div className="text-[11px] font-bold uppercase tracking-widest text-gov-blue">Capacidade Institucional</div>
        <h3 className="font-display text-2xl font-bold mt-2">Para quem a plataforma gera valor</h3>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {beneficios.map((b) => (
            <div key={b.p} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-gov-navy/70">{b.p}</div>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{b.t}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}