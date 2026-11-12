import type { EstadoConector, ResultadoVerificacao } from "../dominio/tipos";

export type ContextoConsulta = {
  /** Função de requisição HTTP. Injetada para permitir testes sem rede. */
  fetch: typeof fetch;
  /** Leitura de variáveis de ambiente do SERVIDOR (nunca do navegador). */
  env: (nome: string) => string | undefined;
  /** Relógio injetável, para testes. */
  agora: () => Date;
};

export type InfoConector = {
  id: string;
  nome: string;
  fonte: string;
  estado: EstadoConector;
  /** Requisitos do catálogo que este conector verifica. */
  requisitos: string[];
  /** Link oficial para conferência ou consulta manual. */
  urlOficial: string;
  /** O que é preciso para ativar a consulta automática (vazio quando já é automática). */
  requisitosAtivacao: string[];
  /** Variáveis de ambiente que o conector lê (somente servidor). */
  variaveisAmbiente: string[];
};

export interface Conector {
  info: InfoConector;
  /** Verdadeiro se, neste ambiente, o conector tem o que precisa para consultar. */
  configurado(ctx: ContextoConsulta): boolean;
  /**
   * Consulta a fonte para os requisitos indicados.
   * Nunca lança erro por indisponibilidade da fonte: devolve status "indisponivel".
   */
  consultar(
    cnpj: string,
    requisitos: { id: string; nome: string }[],
    ctx: ContextoConsulta,
  ): Promise<ResultadoVerificacao[]>;
}
