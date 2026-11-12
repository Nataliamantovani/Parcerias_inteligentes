import type { ResultadoVerificacao, StatusVerificacao } from "./tipos";

/** Ordem de exibição: o que exige atenção primeiro. */
export const ORDEM_STATUS: StatusVerificacao[] = [
  "irregular",
  "vencido",
  "analise_humana",
  "indisponivel",
  "nao_realizada",
  "regular",
  "nao_aplicavel",
];

export const ROTULO_STATUS: Record<StatusVerificacao, string> = {
  regular: "Regularidade verificada",
  irregular: "Irregularidade identificada",
  vencido: "Documento vencido",
  indisponivel: "Consulta indisponível",
  nao_realizada: "Consulta não realizada",
  nao_aplicavel: "Não aplicável",
  analise_humana: "Requer análise humana",
};

/** AAAA-MM-DD em horário de Brasília. */
export function hojeISO(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

/**
 * Marca como "vencido" um resultado regular cuja validade já passou.
 * Não altera nenhum outro status: uma irregularidade continua irregularidade,
 * e uma consulta indisponível continua indisponível (nunca vira "regular").
 */
export function aplicarValidade(r: ResultadoVerificacao, hoje: string): ResultadoVerificacao {
  if (r.status === "regular" && r.validade && r.validade < hoje) {
    return {
      ...r,
      status: "vencido",
      requerAnalise: true,
      resumo: `${r.resumo} Validade expirada em ${r.validade}.`,
    };
  }
  return r;
}

export type ResumoRegularidade = {
  contagem: Record<StatusVerificacao, number>;
  /** Resultados que pedem providência ou leitura humana. */
  pendencias: ResultadoVerificacao[];
  /** Verdadeiro só quando TODOS os requisitos aplicáveis foram verificados em fonte oficial e estão regulares. */
  todosVerificadosRegulares: boolean;
  /** Frase neutra para o topo do painel e do dossiê. Nunca afirma "habilitado". */
  sintese: string;
};

export function consolidar(resultados: ResultadoVerificacao[], hoje: string): ResumoRegularidade {
  const ajustados = resultados.map((r) => aplicarValidade(r, hoje));
  const contagem = Object.fromEntries(ORDEM_STATUS.map((s) => [s, 0])) as Record<
    StatusVerificacao,
    number
  >;
  for (const r of ajustados) contagem[r.status]++;

  const pendencias = ajustados
    .filter((r) => r.status !== "regular" && r.status !== "nao_aplicavel")
    .sort((a, b) => ORDEM_STATUS.indexOf(a.status) - ORDEM_STATUS.indexOf(b.status));

  const aplicaveis = ajustados.filter((r) => r.status !== "nao_aplicavel");
  const todosVerificadosRegulares =
    aplicaveis.length > 0 &&
    aplicaveis.every((r) => r.status === "regular" && r.origem === "fonte_oficial");

  let sintese: string;
  if (contagem.irregular > 0) {
    sintese = `${contagem.irregular} restrição(ões) identificada(s) em fonte oficial. Requer análise do servidor responsável.`;
  } else if (todosVerificadosRegulares) {
    sintese =
      "Nenhuma restrição encontrada nas fontes consultadas. A conclusão sobre a habilitação cabe ao servidor responsável.";
  } else {
    const faltam = pendencias.length;
    sintese = `Verificação incompleta: ${faltam} requisito(s) sem resultado conclusivo. Não presuma regularidade.`;
  }

  return { contagem, pendencias, todosVerificadosRegulares, sintese };
}
