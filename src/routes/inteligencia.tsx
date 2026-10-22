import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GraduationCap, Sparkles, BookOpen, Archive, Award, AlertCircle, Lightbulb, Share2, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/inteligencia")({
  head: () => ({
    meta: [
      { title: "Inteligência Institucional — PNGI" },
      { name: "description", content: "Transformação do conhecimento tácito dos servidores em conhecimento estruturado e reutilizável." },
    ],
  }),
  component: Page,
});

const licoes = [
  { t: "Cláusulas de repasse mensal reduzem inconformidades em 60%", area: "Financeiro", fonte: "Consolidação de 12 instrumentos · 2023" },
  { t: "Plano de trabalho com indicadores quantitativos melhora monitoramento", area: "Governança", fonte: "Convênio 012/2024" },
  { t: "Diligência preventiva no 1º trimestre antecipa 60% das pendências", area: "Risco", fonte: "Análise consolidada 2023" },
  { t: "Definição prévia de marcos de prestação de contas reduz glosas", area: "Conformidade", fonte: "Estudo de 38 ACTs" },
];

const boas = [
  { t: "Modelo UnB de cooperação acadêmica com governança compartilhada", inst: "ACT 118/2024" },
  { t: "Posto INSS digital — replicável a 30 municípios prioritários", inst: "Convênio 012/2024" },
  { t: "Trilha de evidências automatizada via integração SIAFI", inst: "Padrão técnico" },
  { t: "Comitê tripartite de execução com agenda mensal pública", inst: "ACT 042/2023" },
];

const casos = [
  { t: "Acordo INSS · UnB", r: "Redução de 48% no tempo de análise documental e estruturação de 14 indicadores quantitativos.", area: "Cooperação acadêmica" },
  { t: "Convênio SES-RS", r: "Diligência preventiva evitou interrupção da execução e preservou R$ 12,4 Mi em repasses.", area: "Saúde" },
  { t: "Termo de Adesão Municipal", r: "Modelo padronizado replicado para 30 municípios com curva de aprendizado reduzida em 70%.", area: "Atendimento ao cidadão" },
];

const problemas = [
  { t: "Vigências expirando sem aviso prévio", c: "Recorrência alta", n: 28 },
  { t: "Prestação de contas entregue fora do prazo", c: "Recorrência média", n: 19 },
  { t: "Divergência entre plano de trabalho e execução", c: "Recorrência alta", n: 24 },
  { t: "Documentação de contrapartida incompleta", c: "Recorrência média", n: 15 },
];

const recomendacoes = [
  { t: "Padronizar marcos trimestrais de prestação de contas em todos os ACTs", origem: "5 lições aprendidas" },
  { t: "Incluir cláusula de repasse mensal nos novos convênios acima de R$ 1 Mi", origem: "Análise consolidada 2023" },
  { t: "Adotar comitê tripartite de execução em parcerias de longa duração", origem: "Boa prática ACT 042" },
  { t: "Criar checkpoint obrigatório de revisão no 1º trimestre", origem: "Diligência preventiva" },
];

function Page() {
  return (
    <DashboardLayout>
      <header>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Módulo Estratégico · Conhecimento de Estado</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Inteligência Institucional</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          O núcleo de aprendizado da plataforma. Transformamos o conhecimento tácito dos servidores em conhecimento institucional estruturado, reutilizável e protegido contra a rotatividade de equipes — preservando a capacidade do Estado entre gestões.
        </p>
      </header>

      {/* Hero card */}
      <section className="rounded-3xl bg-gradient-to-br from-emerald-700 via-gov-navy to-blue-900 text-white p-8 md:p-10 border border-emerald-500/20 shadow-xl">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">Por que este módulo importa</div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mt-2 leading-tight">
              O conhecimento institucional é o ativo mais valioso da governança pública — e o mais frequentemente perdido.
            </h3>
            <p className="mt-4 text-white/75 leading-relaxed max-w-2xl">
              A plataforma captura, organiza e devolve aos gestores os aprendizados acumulados na execução de parcerias. A IA atua apenas como facilitadora; a inteligência é institucional.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <KStat l="Lições aprendidas" v="86" />
            <KStat l="Boas práticas" v="42" />
            <KStat l="Casos de sucesso" v="24" />
            <KStat l="Recomendações ativas" v="31" />
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-4">
        <Stat icon={<GraduationCap className="size-4" />} l="Lições aprendidas" v="86" />
        <Stat icon={<Sparkles className="size-4" />} l="Boas práticas catalogadas" v="42" />
        <Stat icon={<BookOpen className="size-4" />} l="Itens na base de conhecimento" v="1.214" />
        <Stat icon={<Archive className="size-4" />} l="Registros de memória institucional" v="328" />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="size-4 text-emerald-600" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Lições aprendidas</h4>
          </div>
          <ul className="space-y-4">
            {licoes.map((l) => (
              <li key={l.t} className="border-l-2 border-emerald-400 pl-3">
                <div className="text-sm font-medium">{l.t}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  <span className="font-semibold">{l.area}</span> · {l.fonte}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div id="boas-praticas" className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-gov-blue" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Boas práticas</h4>
          </div>
          <ul className="space-y-4">
            {boas.map((b) => (
              <li key={b.t} className="border-l-2 border-gov-blue pl-3">
                <div className="text-sm font-medium">{b.t}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Fonte: {b.inst}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Casos de sucesso */}
      <section id="casos" className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200">
        <div className="flex items-center gap-2 mb-5">
          <Award className="size-4 text-amber-600" />
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Casos de sucesso</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {casos.map((c) => (
            <div key={c.t} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">{c.area}</div>
              <div className="font-display text-base font-bold mt-1">{c.t}</div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problemas recorrentes e recomendações */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="size-4 text-rose-600" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Problemas recorrentes identificados</h4>
          </div>
          <ul className="space-y-3">
            {problemas.map((p) => (
              <li key={p.t} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">{p.t}</div>
                  <div className="text-[11px] text-slate-500">{p.c}</div>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">{p.n} casos</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="recomendacoes" className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="size-4 text-emerald-600" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Recomendações institucionais</h4>
          </div>
          <ul className="space-y-3">
            {recomendacoes.map((r) => (
              <li key={r.t} className="border-l-2 border-emerald-500 pl-3">
                <div className="text-sm font-medium">{r.t}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Origem: {r.origem}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Indicadores de preservação */}
      <section className="p-6 md:p-8 rounded-2xl bg-gov-navy text-white">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="size-4 text-emerald-300" />
          <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">Indicadores de preservação do conhecimento</h4>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { k: "94%", l: "Continuidade após rotatividade de equipes" },
            { k: "1.214", l: "Itens consultáveis na base de conhecimento" },
            { k: "+27%", l: "Reuso de aprendizados em novos instrumentos" },
            { k: "328", l: "Decisões com memória institucional registrada" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="font-display text-2xl font-bold">{s.k}</div>
              <div className="text-[11px] text-white/60 mt-1 leading-relaxed">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="base" className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="size-4 text-gov-blue" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Conhecimento compartilhado</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Lições, boas práticas e recomendações são publicadas para todos os órgãos integrados — o que um servidor aprende fortalece todo o Estado.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="size-4 text-gov-blue" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Base de conhecimento</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Repositório estruturado de normativos, modelos, pareceres, FAQs operacionais e roteiros, indexado e consultável pelo Ideobaldo.
          </p>
          <Link to="/ideobaldo" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gov-blue hover:underline">
            Consultar com apoio do assistente →
          </Link>
        </div>
      </section>

      <section id="memoria">
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Users className="size-4 text-gov-blue" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-600">Memória institucional</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Histórico de decisões, contextos, pessoas envolvidas e raciocínio que originou cada instrumento. Garante continuidade quando equipes mudam.
          </p>
        </div>
      </section>
    </DashboardLayout>
  );
}

function KStat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="font-display text-2xl font-bold text-white">{v}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/60 mt-1">{l}</div>
    </div>
  );
}

function Stat({ icon, l, v }: { icon: React.ReactNode; l: string; v: string }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="text-emerald-600">{icon}</span>{l}
      </div>
      <div className="font-display text-2xl font-bold mt-2">{v}</div>
    </div>
  );
}