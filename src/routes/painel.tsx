import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { instruments, lifecyclePhases, riskBadge, riskBar } from "@/lib/mock-data";
import {
  AlertTriangle,
  CalendarClock,
  FileWarning,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Activity,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel Executivo — PNGI" },
      { name: "description", content: "Indicadores estratégicos, alertas e instrumentos prioritários para a alta administração." },
    ],
  }),
  component: Painel,
});

function Painel() {
  const total = lifecyclePhases.reduce((a, p) => a + p.count, 0);
  const top = [...instruments].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);

  return (
    <DashboardLayout>
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gov-blue mb-2">Painel Executivo · Visão Estratégica</div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Governança em tempo real</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Indicadores, alertas e prioridades para gestores e alta administração do SIGACT IA — INSS.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50">Exportar relatório</button>
          <Link to="/ideobaldo" className="px-4 py-2 text-sm font-semibold bg-gov-navy text-white rounded-lg hover:bg-slate-800 inline-flex items-center gap-2">
            <Sparkles className="size-4" /> Perguntar ao Ideobaldo
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Kpi label="Instrumentos Ativos" value="1.248" icon={<FileCheck2 className="size-4" />} tone="blue" />
        <Kpi label="Em Monitoramento" value="124" icon={<Activity className="size-4" />} tone="emerald" />
        <Kpi label="Vigência Crítica" value="42" icon={<CalendarClock className="size-4" />} tone="amber" />
        <Kpi label="Fiscalizações em Andamento" value="38" icon={<ShieldCheck className="size-4" />} tone="blue" />
        <Kpi label="Recomendações Emitidas" value="427" icon={<Sparkles className="size-4" />} tone="indigo" />
        <Kpi label="Lições Registradas" value="86" icon={<BookOpen className="size-4" />} tone="slate" />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Instrumentos por tipo">
          <Bars
            data={[
              { l: "Acordo de Cooperação Técnica", v: 612, c: "bg-gov-blue" },
              { l: "Convênio", v: 318, c: "bg-emerald-500" },
              { l: "Termo de Fomento", v: 142, c: "bg-amber-500" },
              { l: "Termo de Colaboração", v: 104, c: "bg-indigo-500" },
              { l: "Acordo de Adesão", v: 72, c: "bg-rose-500" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Instrumentos por nível de risco">
          <div className="flex items-end justify-around h-44 gap-4 pt-4">
            {[
              { l: "Baixo", v: 78, c: "bg-emerald-500" },
              { l: "Médio", v: 52, c: "bg-amber-500" },
              { l: "Alto", v: 24, c: "bg-rose-500" },
            ].map((b) => (
              <div key={b.l} className="flex flex-col items-center flex-1">
                <div className="text-xs font-mono text-slate-500 mb-1">{b.v}%</div>
                <div className={"w-full rounded-t-md " + b.c} style={{ height: `${b.v * 1.4}px` }} />
                <div className="text-xs font-semibold text-slate-600 mt-2">{b.l}</div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Situação das vigências">
          <div className="space-y-3 pt-2">
            {[
              { l: "Vigente", v: 78, c: "bg-emerald-500" },
              { l: "Vence em 90 dias", v: 14, c: "bg-amber-500" },
              { l: "Vence em 30 dias", v: 6, c: "bg-rose-500" },
              { l: "Encerrado", v: 2, c: "bg-slate-300" },
            ].map((r) => (
              <div key={r.l}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">{r.l}</span>
                  <span className="font-mono text-slate-400">{r.v}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={"h-full " + r.c} style={{ width: `${r.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      {/* Three lateral panels */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel
          title="O que requer atenção"
          tone="rose"
          icon={<AlertTriangle className="size-4" />}
          items={[
            { t: "Convênio 027/2022 — vence em 12 dias", s: "Vigência crítica" },
            { t: "Fundação Alfa — certidão fiscal pendente", s: "Pendência documental" },
            { t: "Termo 088/2023 — fiscalização prioritária", s: "Fiscalização sugerida" },
            { t: "8 instrumentos com obrigações em atraso", s: "Cumprimento" },
          ]}
        />
        <Panel
          title="O que aprendemos"
          tone="emerald"
          icon={<GraduationCap className="size-4" />}
          items={[
            { t: "Cláusulas de repasse mensal reduzem inconformidades", s: "Padrão recorrente" },
            { t: "Causa raiz: planos de trabalho sem indicadores", s: "Inconformidade típica" },
            { t: "Diligência preventiva no 1º trimestre é mais eficaz", s: "Recomendação institucional" },
          ]}
        />
        <Panel
          title="O que a IA recomenda"
          tone="blue"
          icon={<Sparkles className="size-4" />}
          items={[
            { t: "Priorizar acompanhamento de 24 instrumentos no Q4", s: "Ação preventiva" },
            { t: "Aplicar boa prática do ACT UnB em 6 acordos novos", s: "Oportunidade de melhoria" },
            { t: "Atualizar normativos referenciados em 12 termos", s: "Conformidade" },
          ]}
        />
      </section>

      {/* Top risks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 id="prioritarios" className="font-display text-xl font-bold">Instrumentos Prioritários</h3>
          <Link to="/risco" className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600 hover:bg-slate-200">Ver priorização completa →</Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 font-semibold text-slate-500">Parceiro / Instrumento</th>
                <th className="px-6 py-3 font-semibold text-slate-500">Indicador</th>
                <th className="px-6 py-3 font-semibold text-slate-500">Sinalização</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <div className="font-semibold">{i.id} — {i.partner}</div>
                    <div className="text-xs text-slate-400">Vigência: {i.validity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                        <div className={"h-full " + riskBar(i.riskLevel)} style={{ width: `${i.riskScore * 10}%` }} />
                      </div>
                      <span className="font-mono text-xs text-slate-500">{i.riskScore.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={"px-2 py-1 rounded-full text-[10px] font-bold uppercase " + riskBadge(i.riskLevel)}>
                      {i.riskLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to="/monitoramento" className="text-gov-blue font-medium hover:underline">Acompanhar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="resultados" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Result k="32%" l="Redução de inconformidades documentais no último trimestre" />
        <Result k="86" l="Lições aprendidas catalogadas e disponíveis para reuso" />
        <Result k="427" l="Recomendações geradas pela IA para fiscalização orientada por evidência" />
      </section>

      <section>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Ciclo de Vida dos Instrumentos</h4>
            <span className="text-xs text-slate-400">{total.toLocaleString("pt-BR")} no ciclo</span>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {lifecyclePhases.map((p) => {
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={p.phase} className="p-4 rounded-xl bg-slate-50">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{p.phase}</div>
                  <div className="mt-1 font-display text-2xl font-bold">{p.count}</div>
                  <div className="mt-3 h-1.5 bg-white rounded-full overflow-hidden">
                    <div className={"h-full " + p.color} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

function Kpi({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  const tones: Record<string, string> = {
    blue: "text-gov-blue bg-gov-blue/10",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
    slate: "text-slate-600 bg-slate-100",
  };
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className={"size-7 grid place-items-center rounded-md " + tones[tone]}>{icon}</div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200">
      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">{title}</h4>
      {children}
    </div>
  );
}

function Bars({ data }: { data: { l: string; v: number; c: string }[] }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="space-y-3 pt-2">
      {data.map((b) => (
        <div key={b.l}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 truncate pr-2">{b.l}</span>
            <span className="font-mono text-slate-400">{b.v}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={"h-full " + b.c} style={{ width: `${(b.v / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Panel({
  title,
  tone,
  icon,
  items,
}: {
  title: string;
  tone: "rose" | "emerald" | "blue";
  icon: React.ReactNode;
  items: { t: string; s: string }[];
}) {
  const tones = {
    rose: { bar: "bg-rose-500", chip: "bg-rose-50 text-rose-600" },
    emerald: { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-600" },
    blue: { bar: "bg-gov-blue", chip: "bg-blue-50 text-gov-blue" },
  }[tone];
  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
      <div className={"h-1 " + tones.bar} />
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm font-bold mb-4">
          <div className={"size-7 grid place-items-center rounded-md " + tones.chip}>{icon}</div>
          {title}
        </div>
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.t} className="text-sm">
              <div className="font-medium text-slate-800">{it.t}</div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400 mt-0.5">{it.s}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Result({ k, l }: { k: string; l: string }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-gov-navy to-slate-800 text-white">
      <div className="font-display text-3xl font-bold">{k}</div>
      <div className="text-xs text-white/70 mt-2 leading-relaxed">{l}</div>
    </div>
  );
}