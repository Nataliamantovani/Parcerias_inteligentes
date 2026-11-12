/**
 * Catálogo configurável de requisitos de habilitação e regularidade.
 *
 * ATENÇÃO: as modalidades abaixo são uma CONFIGURAÇÃO INICIAL DE EXEMPLO,
 * montada para demonstrar o mecanismo. A lista de requisitos exigíveis em cada
 * modalidade, e a base legal de cada um, devem ser definidas e validadas pela
 * área jurídica do órgão que adotar a plataforma. Por isso o campo `baseLegal`
 * começa como "a definir": o sistema não presume fundamento jurídico.
 */

export type Requisito = {
  id: string;
  nome: string;
  descricao: string;
  /** Fonte oficial de referência para o requisito. */
  fonte: string;
  baseLegal: string;
  /**
   * Restringe a aplicação por natureza jurídica do parceiro (código da Receita, ex.: "399-9").
   * Recebe o código e devolve se o requisito se aplica. Ausente = aplica-se a todos.
   * Se a natureza jurídica for desconhecida, o requisito é tratado como aplicável.
   */
  aplicavelA?: (codigoNaturezaJuridica: string) => boolean;
};

export type Modalidade = {
  id: string;
  nome: string;
  descricao: string;
  requisitos: string[];
};

const A_DEFINIR = "A definir pela área jurídica do órgão";

/** Natureza jurídica do grupo 3 da tabela da Receita: entidades sem fins lucrativos. */
export const ehEntidadeSemFinsLucrativos = (codigo: string) => codigo.trim().startsWith("3");

export const REQUISITOS: Record<string, Requisito> = {
  situacao_cadastral: {
    id: "situacao_cadastral",
    nome: "Situação cadastral no CNPJ",
    descricao: "Inscrição ativa no Cadastro Nacional da Pessoa Jurídica.",
    fonte: "Receita Federal — CNPJ",
    baseLegal: A_DEFINIR,
  },
  regularidade_fiscal_federal: {
    id: "regularidade_fiscal_federal",
    nome: "Regularidade fiscal federal e Dívida Ativa da União",
    descricao: "Certidão conjunta RFB/PGFN (CND ou CPEND).",
    fonte: "Receita Federal e PGFN",
    baseLegal: A_DEFINIR,
  },
  regularidade_fgts: {
    id: "regularidade_fgts",
    nome: "Regularidade perante o FGTS",
    descricao: "Certificado de Regularidade do FGTS (CRF).",
    fonte: "Caixa Econômica Federal",
    baseLegal: A_DEFINIR,
  },
  regularidade_trabalhista: {
    id: "regularidade_trabalhista",
    nome: "Regularidade trabalhista",
    descricao: "Certidão Negativa de Débitos Trabalhistas (CNDT).",
    fonte: "Tribunal Superior do Trabalho",
    baseLegal: A_DEFINIR,
  },
  sancao_ceis: {
    id: "sancao_ceis",
    nome: "Ausência de registro no CEIS",
    descricao: "Cadastro de Empresas Inidôneas e Suspensas.",
    fonte: "CGU — Portal da Transparência",
    baseLegal: A_DEFINIR,
  },
  sancao_cnep: {
    id: "sancao_cnep",
    nome: "Ausência de registro no CNEP",
    descricao: "Cadastro Nacional de Empresas Punidas (Lei 12.846/2013).",
    fonte: "CGU — Portal da Transparência",
    baseLegal: A_DEFINIR,
  },
  impedimento_cepim: {
    id: "impedimento_cepim",
    nome: "Ausência de impedimento no CEPIM",
    descricao: "Cadastro de Entidades Privadas sem Fins Lucrativos Impedidas.",
    fonte: "CGU — Portal da Transparência",
    baseLegal: A_DEFINIR,
    aplicavelA: ehEntidadeSemFinsLucrativos,
  },
  consulta_consolidada_tcu: {
    id: "consulta_consolidada_tcu",
    nome: "Consulta consolidada de pessoa jurídica (TCU)",
    descricao: "Licitantes inidôneos (TCU), CNIA (CNJ), CEIS e CNEP em um só documento.",
    fonte: "Tribunal de Contas da União",
    baseLegal: A_DEFINIR,
  },
  cadin: {
    id: "cadin",
    nome: "Situação no CADIN",
    descricao: "Cadastro Informativo de créditos não quitados do setor público federal.",
    fonte: "PGFN — CADIN",
    baseLegal: A_DEFINIR,
  },
  sicaf: {
    id: "sicaf",
    nome: "Situação no SICAF",
    descricao:
      "Cadastro e níveis de habilitação no Sistema de Cadastramento Unificado de Fornecedores.",
    fonte: "SICAF — Compras.gov.br",
    baseLegal: A_DEFINIR,
  },
  autorizacao_bcb: {
    id: "autorizacao_bcb",
    nome: "Autorização de funcionamento (Banco Central)",
    descricao: "Instituição autorizada a funcionar pelo Banco Central do Brasil.",
    fonte: "Banco Central do Brasil",
    baseLegal: A_DEFINIR,
  },
};

export const MODALIDADES: Modalidade[] = [
  {
    id: "act_instituicao_financeira",
    nome: "ACT com instituição financeira",
    descricao: "Acordo de Cooperação Técnica com instituição autorizada pelo Banco Central.",
    requisitos: [
      "situacao_cadastral",
      "regularidade_fiscal_federal",
      "regularidade_fgts",
      "regularidade_trabalhista",
      "sancao_ceis",
      "sancao_cnep",
      "consulta_consolidada_tcu",
      "cadin",
      "autorizacao_bcb",
    ],
  },
  {
    id: "parceria_osc",
    nome: "Parceria com organização da sociedade civil",
    descricao: "Termos de fomento, colaboração ou acordos com entidades sem fins lucrativos.",
    requisitos: [
      "situacao_cadastral",
      "regularidade_fiscal_federal",
      "regularidade_fgts",
      "regularidade_trabalhista",
      "sancao_ceis",
      "sancao_cnep",
      "impedimento_cepim",
      "consulta_consolidada_tcu",
      "cadin",
    ],
  },
  {
    id: "act_geral",
    nome: "ACT com outras pessoas jurídicas",
    descricao: "Acordo de Cooperação Técnica sem regra específica de modalidade.",
    requisitos: [
      "situacao_cadastral",
      "regularidade_fiscal_federal",
      "regularidade_fgts",
      "regularidade_trabalhista",
      "sancao_ceis",
      "sancao_cnep",
      "consulta_consolidada_tcu",
      "sicaf",
    ],
  },
];

export function buscarModalidade(id: string): Modalidade | undefined {
  return MODALIDADES.find((m) => m.id === id);
}

/**
 * Requisitos de uma modalidade, cada um marcado como aplicável ou não
 * conforme a natureza jurídica do parceiro (quando conhecida).
 */
export function requisitosAplicaveis(
  modalidade: Modalidade,
  codigoNaturezaJuridica?: string,
): { requisito: Requisito; aplicavel: boolean }[] {
  return modalidade.requisitos.map((id) => {
    const requisito = REQUISITOS[id];
    if (!requisito) throw new Error(`Requisito desconhecido no catálogo: ${id}`);
    const aplicavel =
      !requisito.aplicavelA || !codigoNaturezaJuridica
        ? true
        : requisito.aplicavelA(codigoNaturezaJuridica);
    return { requisito, aplicavel };
  });
}
