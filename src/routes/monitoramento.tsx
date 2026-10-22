import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Activity, ClipboardCheck, FileSearch, Wrench } from "lucide-react";

export const Route = createFileRoute("/monitoramento")({
  head: () => ({
    meta: [
      { title: "Monitoramento e Fiscalização — PNGI" },
      { name: "description", content: "Acompanhamento das obrigações dos instrumentos durante toda a vigência, com evidências e medidas corretivas." },
    ],
  }),
  component: Page,
});

const fiscalizacoes = [
  { id: "FISC-2024-118", inst: "Convênio 027/2022 · SES-RS", status: "Em andamento", tipo: "Fiscalização in loco", prazo: "12/12/2024" },
  { id: "FISC-2024-112", inst: "ACT 042/2023 · Fundação Alfa", status: "Diligência preventiva", tipo: "Documental", prazo: "18/12/2024" },
  { id: "FISC-2024-104", inst: "TF 088/2023 · Instituto BioDev", status: "Concluída", tipo: "Verificação amostral", prazo: "30/11/2024" },
];

const medidas = [
  { t: "Notificação ao parceiro para regularização de certidão fiscal", inst: "ACT 042/2023", st: "Pendente resposta" },
  { t: "Bloqueio preventivo de novos repasses até saneamento", inst: "Convênio 027/2022", st: "Aplicada" },
  { t: "Replanejamento do cronograma físico-financeiro", inst: "TF 088/2023", st: "Em análise" },
];

function Page() {
  return (
    <DashboardLayout>
      <header>
        <div className="text-xs font-bold uppercase tracking-widest text-gov-blue mb-2">Monitoramento e Fiscalização</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Cumprimento das obrigações durante a vigência</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Acompanhar, fiscalizar, registrar evidências e aplicar medidas corretivas — sempre baseado em dados e rastreabilidade.
        </p>
      </header>

      <section className="grid md:grid-cols-4 gap-4">
        <Mini icon={<Activity className="size-4" />} l="Em monitoramento" v="124" />
        <Mini icon={<ClipboardCheck className="size-4" />} l="Fiscalizações ativas" v="38" />
        <Mini icon={<FileSearch className="size-4" />} l="Evidências registradas" v="1.842" />
        <Mini icon={<Wrench className="size-4" />} l="Medidas corretivas" v="27" />
      </section>

      <section id="fiscalizacoes">
        <h3 className="font-display text-xl font-bold mb-3">Fiscalizações</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Identificação</th>
                <th className="px-6 py-3 text-left font-semibold">Instrumento</th>
                <th className="px-6 py-3 text-left font-semibold">Tipo</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Prazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fiscalizacoes.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3 font-mono text-xs">{f.id}</td>
                  <td className="px-6 py-3">{f.inst}</td>
                  <td className="px-6 py-3 text-slate-500">{f.tipo}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gov-blue/10 text-gov-blue">{f.status}</span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{f.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="evidencias" className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Evidências</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Cada obrigação acompanhada gera evidências (documentos, registros, indicadores) com carimbo de origem, autor e data. As evidências compõem trilha completa de auditoria do instrumento.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[{ k: "Documental", v: 842 }, { k: "Financeira", v: 614 }, { k: "Técnica", v: 386 }].map((e) => (
              <div key={e.k} className="p-3 rounded-lg bg-slate-50">
                <div className="font-display text-xl font-bold">{e.v}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-1">{e.k}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="medidas" className="p-6 rounded-2xl bg-white border border-slate-200">
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Medidas corretivas</h4>
          <ul className="space-y-3">
            {medidas.map((m) => (
              <li key={m.t} className="border-l-2 border-amber-400 pl-3">
                <div className="text-sm font-medium">{m.t}</div>
                <div className="text-xs text-slate-500 mt-0.5">{m.inst} · {m.st}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </DashboardLayout>
  );
}

function Mini({ icon, l, v }: { icon: React.ReactNode; l: string; v: string }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="text-gov-blue">{icon}</span>{l}
      </div>
      <div className="font-display text-2xl font-bold mt-2">{v}</div>
    </div>
  );
}