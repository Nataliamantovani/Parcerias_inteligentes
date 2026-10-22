import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { instruments, riskBadge, riskBar } from "@/lib/mock-data";
import { Filter, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/instrumentos")({
  head: () => ({
    meta: [
      { title: "Instrumentos de Cooperação — PNGI" },
      { name: "description", content: "Cadastro único de acordos, convênios e parcerias com histórico de integridade e conformidade." },
    ],
  }),
  component: InstrumentosPage,
});

function InstrumentosPage() {
  return (
    <DashboardLayout>
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-sm font-medium text-gov-blue mb-1">Dados Estruturados</div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Instrumentos de Cooperação</h2>
          <p className="text-sm text-slate-500 mt-1">
            Cadastro único de instrumentos com ciclo de vida padronizado, marcos e critérios objetivos.
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-semibold bg-gov-navy text-white rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
          <Plus className="size-4" /> Novo Instrumento
        </button>
      </header>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Buscar por ID, parceiro ou objeto…"
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-gov-blue/40 focus:ring-2 ring-gov-blue/10 transition-all"
          />
        </div>
        <button className="px-4 py-2 text-sm font-medium border border-slate-200 bg-white rounded-lg inline-flex items-center gap-2 text-slate-600 hover:bg-slate-50">
          <Filter className="size-4" /> Filtros
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold text-slate-600">Instrumento</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Parceiro</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Vigência</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Valor</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Conformidade</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Risco</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {instruments.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold">{i.id}</div>
                  <div className="text-xs text-slate-400">{i.type}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{i.partner}</div>
                  <div className="text-xs text-slate-400 max-w-xs truncate">{i.object}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{i.validity}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{i.value}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                      <div className={"h-full " + (i.compliance >= 80 ? "bg-risk-low" : i.compliance >= 60 ? "bg-risk-mid" : "bg-risk-high")} style={{ width: `${i.compliance}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{i.compliance}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={"size-2 rounded-full " + riskBar(i.riskLevel)} />
                    <span className="text-xs font-semibold uppercase tracking-tight">
                      {i.riskLevel}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={"px-2 py-1 rounded-full text-[10px] font-bold uppercase " +
                    (i.status === "Vigente" ? "bg-emerald-50 text-emerald-600" :
                     i.status === "Em análise" ? "bg-amber-50 text-amber-600" :
                     i.status === "Suspenso" ? "bg-rose-50 text-rose-600" :
                     "bg-slate-100 text-slate-500")
                  }>
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{instruments.length} instrumentos no cadastro único</span>
          <span className="font-mono">Atualizado há 4 minutos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PhaseCard label="Padronização" desc="Fases, marcos e critérios objetivos aplicados a todos os instrumentos." badge="Metodologia" />
        <PhaseCard label="Histórico de Integridade" desc="Sanções administrativas, CEIS, CNEP e certidões consolidadas por parceiro." badge="Conformidade" />
        <PhaseCard label="Trilha de Auditoria" desc="Cada alteração registrada para apoio à fiscalização orientada por risco." badge="Governança" />
      </div>
    </DashboardLayout>
  );
}

function PhaseCard({ label, desc, badge }: { label: string; desc: string; badge: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gov-blue mb-2">{badge}</div>
      <h4 className="font-display font-bold text-base mb-1">{label}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}