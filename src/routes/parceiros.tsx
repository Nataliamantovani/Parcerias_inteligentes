import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { partners } from "@/lib/mock-data";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros — PNGI" },
      { name: "description", content: "Cadastro único de parceiros com histórico de integridade, conformidade e sanções administrativas." },
    ],
  }),
  component: ParceirosPage,
});

function ParceirosPage() {
  return (
    <DashboardLayout>
      <header>
        <div className="text-sm font-medium text-gov-blue mb-1">Cadastro Único</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Parceiros e Histórico Sancionador</h2>
        <p className="text-sm text-slate-500 mt-1">Integridade, conformidade e histórico de sanções administrativas em uma única visão.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {partners.map((p) => (
          <div key={p.cnpj} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-lg bg-slate-100 grid place-items-center">
                <Building2 className="size-5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold truncate">{p.name}</h4>
                  <span className={
                    "text-xs font-bold " +
                    (p.integrity >= 80 ? "text-emerald-600" : p.integrity >= 60 ? "text-amber-600" : "text-rose-600")
                  }>
                    Integridade {p.integrity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">CNPJ {p.cnpj}</p>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={p.integrity >= 80 ? "bg-risk-low h-full" : p.integrity >= 60 ? "bg-risk-mid h-full" : "bg-risk-high h-full"}
                    style={{ width: `${p.integrity}%` }}
                  />
                </div>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <Field label="CEIS" value={p.ceis} tone={p.ceis === "Nada consta" ? "ok" : p.ceis === "Em apuração" ? "warn" : "bad"} />
              <Field label="CNEP" value={p.cnep} tone={p.cnep === "Nada consta" ? "ok" : "bad"} />
              <Field label="Certidões Fiscais" value={p.certidoes} tone={p.certidoes === "Regular" ? "ok" : p.certidoes === "Pendente" ? "warn" : "bad"} />
              <Field label="Instrumentos vinculados" value={String(p.instruments)} tone="neutral" />
            </dl>

            {p.sanctions > 0 && (
              <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {p.sanctions} sanção(ões) administrativa(s) registrada(s) no histórico.
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "bad" | "neutral" }) {
  const toneClass = {
    ok: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-rose-600",
    neutral: "text-slate-700",
  }[tone];
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</dt>
      <dd className={"text-sm font-semibold mt-0.5 " + toneClass}>{value}</dd>
    </div>
  );
}