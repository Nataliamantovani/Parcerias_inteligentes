import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, GitBranch, Users, Scale } from "lucide-react";

export const Route = createFileRoute("/governanca")({
  head: () => ({
    meta: [
      { title: "Governança — PNGI" },
      { name: "description", content: "Metodologia, ciclo de vida, papéis e normativos da governança dos instrumentos de cooperação." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardLayout>
      <header>
        <div className="text-xs font-bold uppercase tracking-widest text-gov-blue mb-2">Governança</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Modelo de governança e ciclo de vida</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Padronização das fases, marcos, critérios, papéis e normativos que regem os instrumentos de cooperação na Administração Pública.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <Card icon={<BookOpen className="size-5" />} title="Metodologia">
          Metodologia nacional unificada que organiza a forma como acordos, convênios, termos de cooperação e parcerias são propostos, celebrados, executados e prestados contas.
        </Card>
        <Card icon={<GitBranch className="size-5" />} title="Ciclo de Vida" id="ciclo">
          Cinco fases padronizadas: Proposição · Celebração · Execução · Monitoramento · Prestação de Contas — cada uma com marcos, evidências e responsáveis claros.
        </Card>
        <Card icon={<Users className="size-5" />} title="Papéis e Responsabilidades" id="papeis">
          Definição institucional dos atores: gestor titular, gestor substituto, fiscal, ordenador, parceiro e auditoria interna — com matriz RACI por fase.
        </Card>
        <Card icon={<Scale className="size-5" />} title="Normativos" id="normativos">
          Catálogo de normativos aplicáveis: Decreto 11.531/2023, Lei 13.019/2014, IN/MGI vigentes, instruções do TCU e regulamentos internos do órgão.
        </Card>
      </section>

      <section>
        <h3 className="font-display text-xl font-bold mb-4">Ciclo de vida em 5 fases</h3>
        <div className="grid md:grid-cols-5 gap-3">
          {[
            { n: 1, t: "Proposição", d: "Estudo preliminar, plano de trabalho, viabilidade jurídica" },
            { n: 2, t: "Celebração", d: "Pareceres, assinatura, publicação e cadastramento" },
            { n: 3, t: "Execução", d: "Cumprimento de obrigações e marcos físico-financeiros" },
            { n: 4, t: "Monitoramento", d: "Acompanhamento contínuo, evidências e medidas corretivas" },
            { n: 5, t: "Prestação de Contas", d: "Aprovação técnica e financeira, arquivamento" },
          ].map((f) => (
            <div key={f.n} className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fase 0{f.n}</div>
              <div className="mt-1 font-display text-lg font-bold">{f.t}</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}

function Card({ icon, title, children, id }: { icon: React.ReactNode; title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="p-6 rounded-2xl bg-white border border-slate-200">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-gov-blue/10 text-gov-blue grid place-items-center">{icon}</div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 mt-3 leading-relaxed">{children}</p>
    </div>
  );
}