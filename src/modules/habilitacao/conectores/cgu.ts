/**
 * Conector oficial: CGU — API de Dados do Portal da Transparência.
 *
 * Cadastros consultados por CNPJ:
 *   GET {base}/ceis?codigoSancionado={cnpj}&pagina=1
 *   GET {base}/cnep?codigoSancionado={cnpj}&pagina=1
 *   GET {base}/cepim?cnpjSancionado={cnpj}&pagina=1
 * Autenticação: cabeçalho "chave-api-dados" com a chave pessoal obtida em
 * https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email (login gov.br).
 *
 * A chave é lida SOMENTE no servidor (variável PORTAL_TRANSPARENCIA_API_KEY).
 * Sem chave, o conector devolve "nao_realizada" — nunca "regular".
 */
import type { RegistroFonte, ResultadoVerificacao } from "../dominio/tipos";
import type { Conector, ContextoConsulta } from "./tipos";

export const CGU_BASE_PADRAO = "https://api.portaldatransparencia.gov.br/api-de-dados";
const URL_CONSULTA_WEB = "https://portaldatransparencia.gov.br/sancoes/consulta";
const URL_CERTIDAO_CGU = "https://certidoes.cgu.gov.br/";
const TEMPO_LIMITE_MS = 15_000;
/** Tamanho de página observado na API; se vier cheia, pode haver mais registros. */
const TAMANHO_PAGINA = 15;

type Cadastro = {
  requisitoId: string;
  sigla: "CEIS" | "CNEP" | "CEPIM";
  endpoint: string;
  parametroCnpj: string;
  /** No CEPIM a presença do registro já indica impedimento; nos demais, depende da vigência. */
  usaVigencia: boolean;
};

const CADASTROS: Cadastro[] = [
  {
    requisitoId: "sancao_ceis",
    sigla: "CEIS",
    endpoint: "ceis",
    parametroCnpj: "codigoSancionado",
    usaVigencia: true,
  },
  {
    requisitoId: "sancao_cnep",
    sigla: "CNEP",
    endpoint: "cnep",
    parametroCnpj: "codigoSancionado",
    usaVigencia: true,
  },
  {
    requisitoId: "impedimento_cepim",
    sigla: "CEPIM",
    endpoint: "cepim",
    parametroCnpj: "cnpjSancionado",
    usaVigencia: false,
  },
];

/** Aceita "dd/mm/aaaa" ou "aaaa-mm-dd[...]" e devolve "aaaa-mm-dd"; outros formatos -> undefined. */
export function normalizarData(valor: unknown): string | undefined {
  if (typeof valor !== "string") return undefined;
  const br = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return undefined;
}

function texto(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return texto(o.descricaoResumida ?? o.nomeExibicao ?? o.nome ?? o.descricao);
  }
  return undefined;
}

/** Extrai, de um registro da API, os campos que interessam ao dossiê. Tolerante a variações. */
export function resumirRegistro(reg: Record<string, unknown>): RegistroFonte {
  const id = reg.id ?? reg.codigoSancao;
  return {
    id: id === undefined || id === null ? undefined : String(id),
    tipoSancao: texto(reg.tipoSancao) ?? texto(reg.motivo),
    orgaoSancionador: texto(reg.orgaoSancionador) ?? texto(reg.orgaoSuperior),
    fonte: texto(reg.fonteSancao),
    fundamentacao: texto(
      (reg.legislacao as Record<string, unknown> | undefined)?.fundamentacaoLegal,
    ),
    dataInicio: normalizarData(reg.dataInicioSancao ?? reg.dataReferencia),
    dataFim: normalizarData(reg.dataFimSancao),
  };
}

function hoje(ctx: ContextoConsulta): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(ctx.agora());
}

async function consultarCadastro(
  cadastro: Cadastro,
  nomeRequisito: string,
  cnpj: string,
  chave: string,
  base: string,
  ctx: ContextoConsulta,
): Promise<ResultadoVerificacao> {
  const verificadoEm = ctx.agora().toISOString();
  const comum = {
    requisitoId: cadastro.requisitoId,
    requisito: nomeRequisito,
    fonte: `CGU — Portal da Transparência (${cadastro.sigla})`,
    origem: "fonte_oficial" as const,
    verificadoEm,
  };
  const evidenciaWeb = {
    descricao: `Consulta pública ${cadastro.sigla} no Portal da Transparência`,
    url: URL_CONSULTA_WEB,
  };
  const indisponivel = (motivo: string): ResultadoVerificacao => ({
    ...comum,
    status: "indisponivel",
    resumo: `${cadastro.sigla}: consulta indisponível (${motivo}). Isto não indica irregularidade.`,
    evidencias: [evidenciaWeb],
    requerAnalise: true,
  });

  const url = `${base}/${cadastro.endpoint}?${cadastro.parametroCnpj}=${cnpj}&pagina=1`;
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  let resposta: Response;
  try {
    resposta = await ctx.fetch(url, {
      headers: { "chave-api-dados": chave, Accept: "application/json" },
      signal: controle.signal,
    });
  } catch (e) {
    const nome = e instanceof Error ? e.name : "";
    return indisponivel(nome === "AbortError" ? "tempo esgotado" : "falha de conexão");
  } finally {
    clearTimeout(timer);
  }

  if (resposta.status === 401 || resposta.status === 403) {
    return indisponivel(`chave de acesso recusada, HTTP ${resposta.status}`);
  }
  if (resposta.status === 429) return indisponivel("limite de requisições atingido");
  if (!resposta.ok) return indisponivel(`HTTP ${resposta.status}`);

  let corpo: unknown;
  try {
    corpo = await resposta.json();
  } catch {
    return indisponivel("resposta em formato inesperado");
  }
  if (!Array.isArray(corpo)) return indisponivel("resposta em formato inesperado");

  const registros = corpo.map((r) => resumirRegistro(r as Record<string, unknown>));
  const possivelmenteIncompleto = registros.length >= TAMANHO_PAGINA;
  const evidencias = [
    evidenciaWeb,
    ...(cadastro.sigla !== "CEPIM"
      ? [{ descricao: "Emissão de certidão negativa CGU (CEIS/CNEP)", url: URL_CERTIDAO_CGU }]
      : []),
    ...registros.map((r) => ({
      descricao: `Registro ${cadastro.sigla} nº ${String(r.id ?? "s/n")}${r.orgaoSancionador ? ` — ${r.orgaoSancionador}` : ""}`,
    })),
  ];

  if (registros.length === 0) {
    return {
      ...comum,
      status: "regular",
      resumo: `${cadastro.sigla}: nada consta para o CNPJ consultado.`,
      evidencias,
      requerAnalise: false,
    };
  }

  const dataHoje = hoje(ctx);
  const vigentes = cadastro.usaVigencia
    ? registros.filter((r) => !r.dataFim || r.dataFim >= dataHoje)
    : registros;

  if (vigentes.length > 0) {
    return {
      ...comum,
      status: "irregular",
      resumo: `${cadastro.sigla}: ${vigentes.length} registro(s) ${cadastro.usaVigencia ? "vigente(s)" : ""} encontrado(s). Requer análise do servidor responsável.${possivelmenteIncompleto ? " Pode haver mais registros além da primeira página." : ""}`,
      evidencias,
      requerAnalise: true,
      detalhes: registros,
    };
  }

  return {
    ...comum,
    status: "analise_humana",
    resumo: `${cadastro.sigla}: constam ${registros.length} registro(s) com sanção encerrada. Verifique se há reflexo na parceria.`,
    evidencias,
    requerAnalise: true,
    detalhes: registros,
  };
}

export const conectorCGU: Conector = {
  info: {
    id: "cgu_portal_transparencia",
    nome: "CGU — Portal da Transparência (CEIS, CNEP, CEPIM)",
    fonte: "Controladoria-Geral da União",
    estado: "integracao_oficial",
    requisitos: CADASTROS.map((c) => c.requisitoId),
    urlOficial: "https://portaldatransparencia.gov.br/api-de-dados",
    requisitosAtivacao: [
      "Chave da API de Dados do Portal da Transparência (gratuita, obtida com login gov.br).",
      "Configurar a chave na variável de ambiente PORTAL_TRANSPARENCIA_API_KEY do servidor.",
      "Liberar a saída de rede do servidor para api.portaldatransparencia.gov.br.",
    ],
    variaveisAmbiente: ["PORTAL_TRANSPARENCIA_API_KEY", "PORTAL_TRANSPARENCIA_API_URL"],
  },

  configurado(ctx) {
    return Boolean(ctx.env("PORTAL_TRANSPARENCIA_API_KEY"));
  },

  async consultar(cnpj, requisitos, ctx) {
    const chave = ctx.env("PORTAL_TRANSPARENCIA_API_KEY");
    const base = ctx.env("PORTAL_TRANSPARENCIA_API_URL") || CGU_BASE_PADRAO;
    const pedidos = CADASTROS.filter((c) => requisitos.some((r) => r.id === c.requisitoId));

    if (!chave) {
      const agora = ctx.agora().toISOString();
      return pedidos.map((c) => ({
        requisitoId: c.requisitoId,
        requisito: requisitos.find((r) => r.id === c.requisitoId)!.nome,
        fonte: `CGU — Portal da Transparência (${c.sigla})`,
        status: "nao_realizada" as const,
        origem: "fonte_oficial" as const,
        resumo: `${c.sigla}: consulta não realizada — chave da API não configurada no servidor.`,
        verificadoEm: agora,
        evidencias: [{ descricao: `Consulta pública ${c.sigla}`, url: URL_CONSULTA_WEB }],
        requerAnalise: true,
      }));
    }

    // Em sequência, para respeitar o limite de requisições da API.
    const resultados: ResultadoVerificacao[] = [];
    for (const c of pedidos) {
      const nome = requisitos.find((r) => r.id === c.requisitoId)!.nome;
      resultados.push(await consultarCadastro(c, nome, cnpj, chave, base, ctx));
    }
    return resultados;
  },
};
