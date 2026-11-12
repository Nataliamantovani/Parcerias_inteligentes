/**
 * Tipos do módulo "Habilitação e Regularidade dos Parceiros".
 *
 * Regra central: o resultado de uma verificação descreve o que a FONTE disse,
 * nunca uma conclusão administrativa. A decisão é sempre do servidor competente.
 */

/** Situação de uma verificação no painel de regularidade. */
export type StatusVerificacao =
  /** A fonte oficial respondeu e não há restrição. */
  | "regular"
  /** A fonte oficial respondeu e registra restrição vigente. */
  | "irregular"
  /** Havia certidão/documento, mas a validade expirou. */
  | "vencido"
  /** A fonte foi chamada e falhou (fora do ar, tempo esgotado, erro). NÃO indica irregularidade. */
  | "indisponivel"
  /** A consulta não foi feita (falta credencial, integração não ativada ou verificação manual pendente). */
  | "nao_realizada"
  /** O requisito não se aplica a este parceiro ou a esta modalidade. */
  | "nao_aplicavel"
  /** Há informação que exige leitura humana (ex.: sanção encerrada, dado ambíguo). */
  | "analise_humana";

/** De onde veio o resultado. O dossiê sempre distingue as duas origens. */
export type OrigemResultado = "fonte_oficial" | "inserido_manualmente";

/** Como um conector está disponível no ambiente atual. */
export type EstadoConector =
  /** Implementado e pronto para consultar quando a credencial estiver configurada. */
  | "integracao_oficial"
  /** Existe API oficial, mas exige adesão institucional (ex.: Conecta gov.br). Estrutura pronta, consulta desligada. */
  | "requer_adesao"
  /** Não há API oficial conhecida: o servidor consulta no site oficial e registra o resultado. */
  | "verificacao_assistida";

export type Evidencia = {
  /** Descrição curta, ex.: "Registro CEIS nº 123456". */
  descricao: string;
  /** Link oficial para conferência humana. */
  url?: string;
};

/** Um registro retornado pela fonte (ex.: uma sanção), reduzido a campos de texto. */
export type RegistroFonte = Record<string, string | undefined>;

export type ResultadoVerificacao = {
  requisitoId: string;
  requisito: string;
  fonte: string;
  status: StatusVerificacao;
  origem: OrigemResultado;
  /** Texto curto exibido no painel. */
  resumo: string;
  /** ISO 8601 do momento da consulta (ou do registro manual). */
  verificadoEm: string;
  /** Data de validade (AAAA-MM-DD), quando a fonte informa. */
  validade?: string;
  evidencias: Evidencia[];
  /** Verdadeiro quando o resultado deve ser lido por um servidor antes de qualquer conclusão. */
  requerAnalise: boolean;
  /** Registros retornados pela fonte, resumidos, para o dossiê. */
  detalhes?: RegistroFonte[];
};

export type IdentificacaoParceiro = {
  cnpj: string;
  razaoSocial?: string;
  naturezaJuridica?: { codigo: string; descricao?: string };
  situacaoCadastral?: string;
  /** Origem dos dados cadastrais; ausente quando nenhuma fonte foi consultada. */
  origem?: OrigemResultado;
};

export type RelatorioRegularidade = {
  parceiro: IdentificacaoParceiro;
  modalidadeId: string;
  modalidade: string;
  geradoEm: string;
  resultados: ResultadoVerificacao[];
};
