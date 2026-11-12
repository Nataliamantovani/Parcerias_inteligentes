import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  CalendarX,
  CircleCheck,
  CircleDashed,
  CircleMinus,
  CircleX,
  CloudOff,
  ExternalLink,
  Eye,
  FileSearch,
  Info,
  PencilLine,
  PlugZap,
  ShieldAlert,
} from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { relatorioSemConsulta } from "@/modules/habilitacao/dominio/checklist";
import { cnpjValido, formatarCnpj, somenteDigitos } from "@/modules/habilitacao/dominio/cnpj";
import { ROTULO_STATUS, consolidar, hojeISO } from "@/modules/habilitacao/dominio/consolidacao";
import { MODALIDADES } from "@/modules/habilitacao/dominio/requisitos";
import type {
  EstadoConector,
  RelatorioRegularidade,
  ResultadoVerificacao,
  StatusVerificacao,
} from "@/modules/habilitacao/dominio/tipos";
import {
  obterSituacaoFontes,
  verificarRegularidade,
} from "@/modules/habilitacao/servico/habilitacao.functions";

export const Route = createFileRoute("/habilitacao")({
  head: () => ({
    meta: [
      { title: "Habilitação e Regularidade dos Parceiros — PNGI" },
      {
        name: "description",
        content:
          "Consulta, consolidação e registro das condições de habilitação e regularidade de instituições parceiras.",
      },
    ],
  }),
  loader: () => obterSituacaoFontes(),
  component: HabilitacaoPage,
});

const ESTILO_STATUS: Record<StatusVerificacao, { classe: string; icone: ReactNode }> = {
  regular: {
    classe: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icone: <CircleCheck className="size-3.5" />,
  },
  irregular: {
    classe: "bg-rose-50 text-rose-700 border-rose-200",
    icone: <CircleX className="size-3.5" />,
  },
  vencido: {
    classe: "bg-orange-50 text-orange-700 border-orange-200",
    icone: <CalendarX className="size-3.5" />,
  },
  indisponivel: {
    classe: "bg-slate-100 text-slate-700 border-slate-300",
    icone: <CloudOff className="size-3.5" />,
  },
  nao_realizada: {
    classe: "bg-white text-slate-500 border-dashed border-slate-300",
    icone: <CircleDashed className="size-3.5" />,
  },
  nao_aplicavel: {
    classe: "bg-slate-50 text-slate-400 border-slate-200",
    icone: <CircleMinus className="size-3.5" />,
  },
  analise_humana: {
    classe: "bg-amber-50 text-amber-700 border-amber-200",
    icone: <Eye className="size-3.5" />,
  },
};

const ROTULO_ESTADO: Record<EstadoConector, { texto: string; classe: string }> = {
  integracao_oficial: { texto: "API oficial", classe: "bg-gov-blue/10 text-gov-blue" },
  requer_adesao: { texto: "Requer adesão (Conecta gov.br)", classe: "bg-amber-50 text-amber-700" },
  verificacao_assistida: { texto: "Verificação assistida", classe: "bg-slate-100 text-slate-600" },
};

function SeloStatus({ status }: { status: StatusVerificacao }) {
  const e = ESTILO_STATUS[status];
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold " +
        e.classe
      }
    >
      {e.icone}
      {ROTULO_STATUS[status]}
    </span>
  );
}

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function dataBR(iso?: string) {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function HabilitacaoPage() {
  const situacao = Route.useLoaderData();
  const [cnpj, setCnpj] = useState("");
  const [modalidadeId, setModalidadeId] = useState(MODALIDADES[0].id);
  const [natureza, setNatureza] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [relatorio, setRelatorio] = useState<RelatorioRegularidade | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  const resumo = useMemo(
    () => (relatorio ? consolidar(relatorio.resultados, hojeISO()) : null),
    [relatorio],
  );
  const resultadosExibidos = useMemo(() => {
    if (!relatorio || !resumo) return [];
    // Aplica a regra de validade também na exibição (ex.: registro manual vencido).
    const pend = new Map(resumo.pendencias.map((p) => [p.requisitoId, p]));
    return relatorio.resultados.map((r) => pend.get(r.requisitoId) ?? r);
  }, [relatorio, resumo]);

  async function aoVerificar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    if (!cnpjValido(cnpj)) {
      setErro("Informe um CNPJ válido (14 dígitos).");
      return;
    }
    const entrada = {
      cnpj: somenteDigitos(cnpj),
      modalidadeId,
      codigoNaturezaJuridica: natureza.trim() || undefined,
    };
    setCarregando(true);
    try {
      const r = await verificarRegularidade({ data: entrada });
      if (r.ok) {
        setRelatorio(r.relatorio);
      } else {
        setAviso(r.motivo);
        setRelatorio(
          relatorioSemConsulta(
            entrada,
            "Consulta automática desativada neste ambiente. Consulte o site oficial e registre o resultado.",
            (requisitoId) => {
              const f = situacao.fontes.find((x) => x.requisitos.includes(requisitoId));
              return f ? { fonte: f.fonte, url: f.urlOficial } : undefined;
            },
          ),
        );
      }
    } catch {
      setErro("Não foi possível concluir a verificação. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function registrarManual(requisitoId: string, novo: ResultadoVerificacao) {
    setRelatorio((atual) =>
      atual
        ? {
            ...atual,
            resultados: atual.resultados.map((r) => (r.requisitoId === requisitoId ? novo : r)),
          }
        : atual,
    );
    setEditando(null);
  }

  return (
    <DashboardLayout>
      <header>
        <div className="text-sm font-medium text-gov-blue mb-1">Instrumentos · Parceiros</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Habilitação e Regularidade dos Parceiros
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Consulta as bases oficiais disponíveis, reúne os resultados em um painel único e registra
          o que foi verificado. O painel apoia a análise; a conclusão sobre a habilitação é sempre
          do servidor responsável.
        </p>
      </header>

      {!situacao.consultasAtivas && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <ShieldAlert className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Consultas automáticas desativadas neste ambiente.</p>
            <p className="mt-1 text-amber-700">
              Por segurança, as bases externas só são consultadas quando houver login e autorização
              do órgão. Até lá, o módulo funciona como lista de verificação: os requisitos aparecem
              com o link oficial e o resultado é registrado manualmente, identificado como tal.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={aoVerificar}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1.2fr_1.6fr_1fr_auto] md:items-end"
      >
        <Campo rotulo="CNPJ do parceiro">
          <input
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            onBlur={() => cnpjValido(cnpj) && setCnpj(formatarCnpj(cnpj))}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-gov-blue focus:outline-none focus:ring-2 focus:ring-gov-blue/20"
          />
        </Campo>
        <Campo rotulo="Modalidade da parceria">
          <select
            value={modalidadeId}
            onChange={(e) => setModalidadeId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-gov-blue focus:outline-none focus:ring-2 focus:ring-gov-blue/20"
          >
            {MODALIDADES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Natureza jurídica (opcional)">
          <input
            value={natureza}
            onChange={(e) => setNatureza(e.target.value)}
            placeholder="ex.: 399-9"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-gov-blue focus:outline-none focus:ring-2 focus:ring-gov-blue/20"
          />
        </Campo>
        <button
          type="submit"
          disabled={carregando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gov-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          <FileSearch className="size-4" />
          {carregando ? "Verificando…" : "Verificar"}
        </button>
        {erro && <p className="text-sm text-rose-600 md:col-span-4">{erro}</p>}
        {aviso && <p className="text-xs text-slate-500 md:col-span-4">{aviso}</p>}
      </form>

      {relatorio && resumo && (
        <>
          <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Identificação do parceiro
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Linha rotulo="CNPJ">
                  <span className="font-mono">{formatarCnpj(relatorio.parceiro.cnpj)}</span>
                </Linha>
                <Linha rotulo="Razão social">
                  {relatorio.parceiro.razaoSocial ?? (
                    <span className="text-slate-400">
                      Não obtida — a consulta ao CNPJ requer adesão ao Conecta gov.br
                    </span>
                  )}
                </Linha>
                <Linha rotulo="Natureza jurídica">
                  {relatorio.parceiro.naturezaJuridica ? (
                    <>
                      <span className="font-mono">
                        {relatorio.parceiro.naturezaJuridica.codigo}
                      </span>
                      {relatorio.parceiro.origem === "inserido_manualmente" && <SeloManual />}
                    </>
                  ) : (
                    <span className="text-slate-400">Não informada</span>
                  )}
                </Linha>
                <Linha rotulo="Situação cadastral">
                  {relatorio.parceiro.situacaoCadastral ?? (
                    <span className="text-slate-400">Ver requisito "Situação cadastral"</span>
                  )}
                </Linha>
                <Linha rotulo="Modalidade">{relatorio.modalidade}</Linha>
                <Linha rotulo="Gerado em">{dataHora(relatorio.geradoEm)}</Linha>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Síntese
              </h3>
              <p className="mt-3 text-base font-semibold leading-snug">{resumo.sintese}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(resumo.contagem) as StatusVerificacao[])
                  .filter((s) => resumo.contagem[s] > 0)
                  .map((s) => (
                    <span key={s} className="inline-flex items-center gap-2">
                      <SeloStatus status={s} />
                      <span className="text-sm font-bold">{resumo.contagem[s]}</span>
                    </span>
                  ))}
              </div>
              <p className="mt-4 flex gap-2 text-xs text-slate-500">
                <Info className="size-4 shrink-0" />
                Uma consulta indisponível ou não realizada nunca é tratada como irregularidade, nem
                como regularidade. Restrições identificadas não suspendem nem rescindem o acordo
                automaticamente.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold">Painel de regularidade</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Requisito</th>
                    <th className="px-4 py-3 min-w-[140px]">Fonte</th>
                    <th className="px-4 py-3">Resultado</th>
                    <th className="px-4 py-3">Verificado em</th>
                    <th className="px-4 py-3">Validade</th>
                    <th className="px-4 py-3">Evidência</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultadosExibidos.map((r) => (
                    <LinhaResultado
                      key={r.requisitoId}
                      r={r}
                      editando={editando === r.requisitoId}
                      aoEditar={() => setEditando(r.requisitoId)}
                      aoCancelar={() => setEditando(null)}
                      aoSalvar={(novo) => registrarManual(r.requisitoId, novo)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-6 py-3 text-xs text-slate-500 border-t border-slate-100">
              Registros manuais ficam nesta tela até a implantação do banco de dados (próxima
              etapa); o histórico permanente e o dossiê em PDF dependem dele.
            </p>
          </section>
        </>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <PlugZap className="size-5 text-gov-blue" />
          <h3 className="font-display text-lg font-bold">Fontes oficiais e situação de ativação</h3>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          O que cada base exige para que a consulta seja automática neste órgão.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {situacao.fontes.map((f) => (
            <div key={f.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold leading-snug">{f.nome}</h4>
                <a
                  href={f.urlOficial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-gov-blue"
                  aria-label={`Site oficial: ${f.nome}`}
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide " +
                    ROTULO_ESTADO[f.estado].classe
                  }
                >
                  {ROTULO_ESTADO[f.estado].texto}
                </span>
                {f.estado === "integracao_oficial" && (
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide " +
                      (f.configurado
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500")
                    }
                  >
                    {f.configurado ? "Credencial configurada" : "Credencial não configurada"}
                  </span>
                )}
              </div>
              {f.requisitosAtivacao.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-slate-600 list-disc pl-4">
                  {f.requisitosAtivacao.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {rotulo}
      </span>
      {children}
    </label>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2">
      <dt className="text-slate-400">{rotulo}</dt>
      <dd className="font-medium flex flex-wrap items-center gap-2">{children}</dd>
    </div>
  );
}

function SeloManual() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
      <PencilLine className="size-3" /> Inserido manualmente
    </span>
  );
}

const STATUS_MANUAIS: StatusVerificacao[] = ["regular", "irregular", "vencido", "analise_humana"];

function LinhaResultado({
  r,
  editando,
  aoEditar,
  aoCancelar,
  aoSalvar,
}: {
  r: ResultadoVerificacao;
  editando: boolean;
  aoEditar: () => void;
  aoCancelar: () => void;
  aoSalvar: (novo: ResultadoVerificacao) => void;
}) {
  const podeRegistrar = r.status === "nao_realizada" || r.status === "indisponivel";
  return (
    <>
      <tr className="align-top">
        <td className="px-6 py-4 min-w-[280px]">
          <div className="font-semibold">{r.requisito}</div>
          <div className="mt-1 text-xs text-slate-500 max-w-md">{r.resumo}</div>
        </td>
        <td className="px-4 py-4 text-xs text-slate-600">{r.fonte}</td>
        <td className="px-4 py-4">
          <div className="flex flex-col items-start gap-1.5">
            <SeloStatus status={r.status} />
            {r.origem === "inserido_manualmente" && <SeloManual />}
            {r.requerAnalise && r.status !== "nao_realizada" && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                Requer análise
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">
          {r.status === "nao_realizada" || r.status === "nao_aplicavel"
            ? "—"
            : dataHora(r.verificadoEm)}
        </td>
        <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">{dataBR(r.validade)}</td>
        <td className="px-4 py-4 text-xs">
          <ul className="space-y-1">
            {r.evidencias.map((ev) => (
              <li key={ev.descricao + (ev.url ?? "")}>
                {ev.url ? (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gov-blue hover:underline"
                  >
                    {ev.descricao} <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <span className="text-slate-600">{ev.descricao}</span>
                )}
              </li>
            ))}
          </ul>
        </td>
        <td className="px-4 py-4 text-right">
          {podeRegistrar && !editando && (
            <button
              onClick={aoEditar}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <PencilLine className="size-3.5" /> Registrar resultado
            </button>
          )}
        </td>
      </tr>
      {editando && <FormularioManual r={r} aoCancelar={aoCancelar} aoSalvar={aoSalvar} />}
    </>
  );
}

function FormularioManual({
  r,
  aoCancelar,
  aoSalvar,
}: {
  r: ResultadoVerificacao;
  aoCancelar: () => void;
  aoSalvar: (novo: ResultadoVerificacao) => void;
}) {
  const [status, setStatus] = useState<StatusVerificacao>("regular");
  const [validade, setValidade] = useState("");
  const [observacao, setObservacao] = useState("");
  const [link, setLink] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function salvar(e: FormEvent) {
    e.preventDefault();
    if (!observacao.trim()) {
      setErro("Descreva o documento conferido (ex.: número e data de emissão da certidão).");
      return;
    }
    if (link && !/^https:\/\//.test(link)) {
      setErro("O link deve começar com https://");
      return;
    }
    aoSalvar({
      ...r,
      status,
      origem: "inserido_manualmente",
      resumo: observacao.trim(),
      verificadoEm: new Date().toISOString(),
      validade: validade || undefined,
      evidencias: [
        ...r.evidencias,
        { descricao: "Documento conferido pelo servidor", ...(link ? { url: link } : {}) },
      ],
      requerAnalise: status !== "regular",
    });
  }

  return (
    <tr className="bg-violet-50/40">
      <td colSpan={7} className="px-6 py-4">
        <form
          onSubmit={salvar}
          className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_2fr_auto] md:items-end"
        >
          <Campo rotulo="Resultado conferido">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusVerificacao)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {STATUS_MANUAIS.map((s) => (
                <option key={s} value={s}>
                  {ROTULO_STATUS[s]}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Validade">
            <input
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </Campo>
          <Campo rotulo="Documento conferido">
            <input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="ex.: CNDT nº 123/2026, emitida em 10/11/2026"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </Campo>
          <Campo rotulo="Link de verificação (opcional)">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </Campo>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-gov-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={aoCancelar}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Cancelar
            </button>
          </div>
          {erro && <p className="text-sm text-rose-600 md:col-span-5">{erro}</p>}
          <p className="text-xs text-violet-700 md:col-span-5">
            Este resultado será identificado como inserido manualmente, separado dos dados obtidos
            de fontes oficiais.
          </p>
        </form>
      </td>
    </tr>
  );
}
