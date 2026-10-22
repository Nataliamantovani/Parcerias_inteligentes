import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { instruments, riskBadge, riskBar } from "@/lib/mock-data";
import { Brain, Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/risco")({
  head: () => ({
    meta: [
      { title: "Motor de Risco IA — PNGI" },
      { name: "description", content: "Indicadores de risco e recomendações de fiscalização orientadas por inteligência artificial." },
    ],
  }),
  component: RiscoPage,
});

function RiscoPage() {
  const ranked = [...instruments].sort((a, b) => b.riskScore - a.riskScore);
  const high = ranked.filter((i) => i.riskLevel === "alto").length;
  const mid = ranked.filter((i) => i.riskLevel === "medio").length;
  const low = ranked.filter((i) => i.riskLevel === "baixo").length;

  return (
    <DashboardLayout>
      <header>
        <div className="text-sm font-medium text-gov-blue mb-1">Inteligência Artificial</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Motor Inteligente de Risco</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Produz indicadores de risco e recomenda prioridades de acompanhamento, monitoramento e fiscalização com base em padrões históricos, dados contextuais e informações de integridade.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RiskBucket label="Risco Alto" count={high} tone="alto" desc="Atuação prioritária recomendada." icon={<Target className="size-4" />} />
        <RiskBucket label="Risco Médio" count={mid} tone="medio" desc="Monitoramento intensivo sugerido." icon={<TrendingUp className="size-4" />} />
        <RiskBucket label="Risco Baixo" count={low} tone="baixo" desc="Acompanhamento de rotina." icon={<Brain className="size-4" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 space-y-4">
          <h3 className="font-display text-xl font-bold">Priorização recomendada pela IA</h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold text-slate-600">Instrumento</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Score</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Sinal Detectado</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Recomendação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ranked.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{i.id}</div>
                      <div className="text-xs text-slate-400">{i.partner}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div className={"h-full " + riskBar(i.riskLevel)} style={{ width: `${i.riskScore * 10}%` }} />
                        </div>
                        <span className="font-bold text-sm">{i.riskScore.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"px-2 py-1 rounded-full text-[10px] font-bold uppercase " + riskBadge(i.riskLevel)}>
                        {i.riskLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {i.riskLevel === "alto"
                        ? "Abrir diligência preventiva e solicitar regularização tempestiva."
                        : i.riskLevel === "medio"
                        ? "Notificar gestor e exigir plano de adequação."
                        : "Manter acompanhamento de rotina."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <h3 className="font-display text-xl font-bold">Sinais usados pelo motor</h3>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <Signal label="Padrões históricos de execução" weight={32} />
            <Signal label="Histórico sancionador (CEIS/CNEP)" weight={24} />
            <Signal label="Dados contextuais do território" weight={18} />
            <Signal label="Conformidade documental" weight={14} />
            <Signal label="Indicadores financeiros" weight={12} />
          </div>
          <div className="bg-gov-navy text-white rounded-2xl p-5 shadow-xl">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Aprendizado contínuo</div>
            <p className="text-sm leading-relaxed">
              O motor reaprende a cada ciclo, incorporando regularizações e novos eventos sancionadores. Versão atual treinada em <strong className="font-mono">427.812</strong> eventos.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function RiskBucket({ label, count, tone, desc, icon }: { label: string; count: number; tone: "alto" | "medio" | "baixo"; desc: string; icon: React.ReactNode }) {
  const toneClass =
    tone === "alto" ? "border-rose-200 bg-rose-50/40" :
    tone === "medio" ? "border-amber-200 bg-amber-50/40" :
    "border-emerald-200 bg-emerald-50/40";
  const valClass =
    tone === "alto" ? "text-risk-high" : tone === "medio" ? "text-risk-mid" : "text-risk-low";
  return (
    <div className={"p-6 rounded-2xl border " + toneClass}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <div className={valClass}>{icon}</div>
      </div>
      <div className={"text-4xl font-display font-bold mt-2 " + valClass}>{count}</div>
      <p className="text-xs text-slate-500 mt-2">{desc}</p>
    </div>
  );
}

function Signal({ label, weight }: { label: string; weight: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className="font-mono text-slate-400">{weight}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gov-blue" style={{ width: `${weight * 2.5}%` }} />
      </div>
    </div>
  );
}