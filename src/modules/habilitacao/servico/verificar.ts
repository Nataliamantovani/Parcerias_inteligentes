/**
 * Orquestra a verificação de um parceiro: identifica os requisitos aplicáveis,
 * chama os conectores correspondentes e monta o relatório.
 *
 * Roda no SERVIDOR. Uma falha de qualquer conector vira "indisponivel" para os
 * requisitos dele — nunca interrompe os demais e nunca vira "regular".
 */
import { conectorDoRequisito } from "../conectores/registro";
import type { ContextoConsulta } from "../conectores/tipos";
import { cnpjValido, somenteDigitos } from "../dominio/cnpj";
import { buscarModalidade, requisitosAplicaveis } from "../dominio/requisitos";
import type {
  IdentificacaoParceiro,
  RelatorioRegularidade,
  ResultadoVerificacao,
} from "../dominio/tipos";

export class ErroDeEntrada extends Error {}

export async function verificarParceiro(
  entrada: { cnpj: string; modalidadeId: string; codigoNaturezaJuridica?: string },
  ctx: ContextoConsulta,
): Promise<RelatorioRegularidade> {
  const cnpj = somenteDigitos(entrada.cnpj);
  if (!cnpjValido(cnpj)) throw new ErroDeEntrada("CNPJ inválido.");
  const modalidade = buscarModalidade(entrada.modalidadeId);
  if (!modalidade) throw new ErroDeEntrada("Modalidade de parceria desconhecida.");

  const agora = ctx.agora().toISOString();
  const itens = requisitosAplicaveis(modalidade, entrada.codigoNaturezaJuridica);

  const naoAplicaveis: ResultadoVerificacao[] = itens
    .filter((i) => !i.aplicavel)
    .map(({ requisito }) => ({
      requisitoId: requisito.id,
      requisito: requisito.nome,
      fonte: requisito.fonte,
      status: "nao_aplicavel",
      origem: "fonte_oficial",
      resumo: "Não se aplica à natureza jurídica informada.",
      verificadoEm: agora,
      evidencias: [],
      requerAnalise: false,
    }));

  // Agrupa os requisitos aplicáveis por conector.
  const porConector = new Map<string, { id: string; nome: string }[]>();
  const semConector: ResultadoVerificacao[] = [];
  for (const { requisito, aplicavel } of itens) {
    if (!aplicavel) continue;
    const conector = conectorDoRequisito(requisito.id);
    if (!conector) {
      semConector.push({
        requisitoId: requisito.id,
        requisito: requisito.nome,
        fonte: requisito.fonte,
        status: "nao_realizada",
        origem: "fonte_oficial",
        resumo: "Nenhum conector cadastrado para este requisito.",
        verificadoEm: agora,
        evidencias: [],
        requerAnalise: true,
      });
      continue;
    }
    const lista = porConector.get(conector.info.id) ?? [];
    lista.push({ id: requisito.id, nome: requisito.nome });
    porConector.set(conector.info.id, lista);
  }

  const execucoes = [...porConector.entries()].map(async ([conectorId, requisitos]) => {
    const conector = conectorDoRequisito(requisitos[0].id)!;
    try {
      return await conector.consultar(cnpj, requisitos, ctx);
    } catch {
      return requisitos.map<ResultadoVerificacao>((r) => ({
        requisitoId: r.id,
        requisito: r.nome,
        fonte: conector.info.fonte,
        status: "indisponivel",
        origem: "fonte_oficial",
        resumo: `Falha interna no conector ${conectorId}. Isto não indica irregularidade.`,
        verificadoEm: ctx.agora().toISOString(),
        evidencias: [{ descricao: "Consulta oficial", url: conector.info.urlOficial }],
        requerAnalise: true,
      }));
    }
  });
  const consultados = (await Promise.all(execucoes)).flat();

  // Mantém a ordem do catálogo da modalidade.
  const todos = [...consultados, ...semConector, ...naoAplicaveis];
  const ordem = modalidade.requisitos;
  todos.sort((a, b) => ordem.indexOf(a.requisitoId) - ordem.indexOf(b.requisitoId));

  const parceiro: IdentificacaoParceiro = {
    cnpj,
    ...(entrada.codigoNaturezaJuridica
      ? {
          naturezaJuridica: { codigo: entrada.codigoNaturezaJuridica },
          origem: "inserido_manualmente" as const,
        }
      : {}),
  };

  return {
    parceiro,
    modalidadeId: modalidade.id,
    modalidade: modalidade.nome,
    geradoEm: agora,
    resultados: todos,
  };
}
