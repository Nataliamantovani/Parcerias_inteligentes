/**
 * Conectores SEM consulta automática neste momento.
 *
 * - "requer_adesao": existe API oficial no Conecta gov.br, mas ela só é liberada
 *   ao órgão público após adesão formal e emissão de credenciais. A estrutura fica
 *   pronta; a chamada só será escrita quando o órgão tiver acesso à documentação
 *   técnica e ao ambiente de homologação. Nenhuma credencial é inventada.
 *
 * - "verificacao_assistida": não foi identificada API oficial de acesso aberto.
 *   O sistema NÃO faz raspagem de site nem contorna CAPTCHA: indica o link oficial
 *   e o servidor registra o resultado manualmente (origem "inserido_manualmente").
 *
 * Em ambos os casos o resultado é "nao_realizada" — nunca "regular".
 */
import type { EstadoConector } from "../dominio/tipos";
import type { Conector, InfoConector } from "./tipos";

function criar(
  info: InfoConector & { estado: Exclude<EstadoConector, "integracao_oficial"> },
): Conector {
  return {
    info,
    configurado: () => false,
    async consultar(_cnpj, requisitos, ctx) {
      const motivo =
        info.estado === "requer_adesao"
          ? "integração oficial depende de adesão do órgão ao Conecta gov.br"
          : "sem API oficial de acesso aberto; consulte o site oficial e registre o resultado";
      return requisitos
        .filter((r) => info.requisitos.includes(r.id))
        .map((r) => ({
          requisitoId: r.id,
          requisito: r.nome,
          fonte: info.fonte,
          status: "nao_realizada" as const,
          origem: "fonte_oficial" as const,
          resumo: `Consulta não realizada: ${motivo}.`,
          verificadoEm: ctx.agora().toISOString(),
          evidencias: [{ descricao: `Consulta oficial — ${info.fonte}`, url: info.urlOficial }],
          requerAnalise: true,
        }));
    },
  };
}

const ADESAO_CONECTA = [
  "Adesão do órgão ao Conecta gov.br (gov.br/conecta) e autorização de uso desta API.",
  "Credenciais (client id / secret) emitidas para a aplicação, guardadas só no servidor.",
  "Documentação técnica e ambiente de homologação da API para implementar e testar a chamada.",
];

export const conectorCnpj = criar({
  id: "receita_cnpj",
  nome: "Receita Federal — Cadastro CNPJ",
  fonte: "Receita Federal — CNPJ",
  estado: "requer_adesao",
  requisitos: ["situacao_cadastral"],
  urlOficial: "https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp",
  requisitosAtivacao: ADESAO_CONECTA,
  variaveisAmbiente: [],
});

export const conectorCnd = criar({
  id: "rfb_pgfn_cnd",
  nome: "Receita Federal e PGFN — Certidão de regularidade fiscal",
  fonte: "Receita Federal e PGFN",
  estado: "requer_adesao",
  requisitos: ["regularidade_fiscal_federal"],
  urlOficial:
    "https://www.gov.br/pt-br/servicos/emitir-certidao-de-regularidade-fiscal-perante-a-fazenda-nacional",
  requisitosAtivacao: [
    ...ADESAO_CONECTA,
    "API de referência: gov.br/conecta/catalogo/apis/consultar-certidao-negativa-de-debito",
  ],
  variaveisAmbiente: [],
});

export const conectorCadin = criar({
  id: "pgfn_cadin",
  nome: "PGFN — CADIN",
  fonte: "PGFN — CADIN",
  estado: "requer_adesao",
  requisitos: ["cadin"],
  urlOficial: "https://www.gov.br/conecta/catalogo/apis/api-cadin-credora",
  requisitosAtivacao: [...ADESAO_CONECTA, "Autorização da PGFN para consulta ao CADIN pelo órgão."],
  variaveisAmbiente: [],
});

export const conectorCndt = criar({
  id: "tst_cndt",
  nome: "TST — Certidão Negativa de Débitos Trabalhistas",
  fonte: "Tribunal Superior do Trabalho",
  estado: "verificacao_assistida",
  requisitos: ["regularidade_trabalhista"],
  urlOficial: "https://cndt-certidao.tst.jus.br/inicio.faces",
  requisitosAtivacao: [
    "Não foi identificada API oficial de acesso aberto. Verificar com o TST ou no catálogo do Conecta gov.br.",
  ],
  variaveisAmbiente: [],
});

export const conectorCrf = criar({
  id: "caixa_crf",
  nome: "Caixa — Certificado de Regularidade do FGTS",
  fonte: "Caixa Econômica Federal",
  estado: "verificacao_assistida",
  requisitos: ["regularidade_fgts"],
  urlOficial: "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf",
  requisitosAtivacao: [
    "Não foi identificada API oficial de acesso aberto. Verificar com a Caixa ou no catálogo do Conecta gov.br.",
  ],
  variaveisAmbiente: [],
});

export const conectorTcu = criar({
  id: "tcu_consolidada",
  nome: "TCU — Consulta consolidada de pessoa jurídica",
  fonte: "Tribunal de Contas da União",
  estado: "verificacao_assistida",
  requisitos: ["consulta_consolidada_tcu"],
  urlOficial: "https://certidoes-apf.apps.tcu.gov.br/",
  requisitosAtivacao: [
    "Não foi identificada API oficial documentada. CEIS e CNEP já são consultados pelo conector da CGU.",
  ],
  variaveisAmbiente: [],
});

export const conectorSicaf = criar({
  id: "sicaf",
  nome: "SICAF — Compras.gov.br",
  fonte: "SICAF — Compras.gov.br",
  estado: "verificacao_assistida",
  requisitos: ["sicaf"],
  urlOficial: "https://www.gov.br/compras/pt-br",
  requisitosAtivacao: [
    "Em avaliação: verificar se a API de Dados Abertos do Compras.gov.br expõe a situação do fornecedor no SICAF.",
  ],
  variaveisAmbiente: [],
});

export const conectorBcb = criar({
  id: "bcb_autorizacao",
  nome: "Banco Central — Autorização de funcionamento",
  fonte: "Banco Central do Brasil",
  estado: "verificacao_assistida",
  requisitos: ["autorizacao_bcb"],
  urlOficial: "https://www.bcb.gov.br/estabilidadefinanceira/encontreinstituicao",
  requisitosAtivacao: [
    "Em avaliação: verificar as APIs de dados abertos do Banco Central para instituições autorizadas.",
  ],
  variaveisAmbiente: [],
});
