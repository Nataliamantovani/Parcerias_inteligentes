import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { auditFindings, riskBadge } from "@/lib/mock-data";
import { ScanSearch } from "lucide-react";

export const Route = createFileRoute("/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoria Inteligente — PNGI" },
      { name: "description", content: "Detecção algorítmica de inconsistências e padrões suspeitos em instrumentos de cooperação." },
    ],
  }),
  component: AuditoriaPage,
});

function AuditoriaPage() {
  return (
    <DashboardLayout>
      <header>
        <div className="text-sm font-medium text-gov-blue mb-1">Inteligência Artificial</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Auditoria Inteligente</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Algoritmos detectam inconsistências, padrões suspeitos e sinalizam situações que demandam atenção gerencial — incluindo integridade, conformidade e histórico sancionador.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Achados ativos" value={auditFindings.length.toString()} />
        <Metric label="Confiança média" value="91%" />
        <Metric label="Última varredura" value="00:12 atrás" />
        <Metric label="Modelos ativos" value="6" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
        {auditFindings.map((f) => (
          <article key={f.id} className="p-6 flex items-start gap-4">
            <div className={
              "size-10 shrink-0 rounded-lg grid place-items-center " +
              (f.severity === "alto" ? "bg-rose-50 text-rose-600" :
               f.severity === "medio" ? "bg-amber-50 text-amber-600" :
               "bg-emerald-50 text-emerald-600")
            }>
              <ScanSearch className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">{f.id}</span>
                    <span>·</span>
                    <span>{f.instrument}</span>
                    <span>·</span>
                    <span>{f.detectedAt}</span>
                  </div>
                  <h4 className="font-semibold mt-1">{f.description}</h4>
                </div>
                <span className={"px-2 py-1 rounded-full text-[10px] font-bold uppercase " + riskBadge(f.severity)}>
                  {f.category}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gov-blue" style={{ width: `${f.confidence}%` }} />
                  </div>
                  <span className="font-mono">{f.confidence.toFixed(1)}% confiança</span>
                </div>
                <span>·</span>
                <button className="text-gov-blue font-semibold hover:underline">Abrir trilha de auditoria</button>
                <button className="text-slate-500 hover:text-gov-navy">Encaminhar ao gestor</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200">
      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl font-display font-bold mt-1">{value}</p>
    </div>
  );
}