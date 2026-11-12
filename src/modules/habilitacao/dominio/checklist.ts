/**
 * Monta o relatório SEM consultar nenhuma fonte: todos os requisitos aplicáveis
 * ficam como "consulta não realizada", prontos para registro manual pelo servidor.
 * Usado quando as consultas automáticas estão desativadas no ambiente.
 */
import { cnpjValido, somenteDigitos } from "./cnpj";
import { buscarModalidade, requisitosAplicaveis } from "./requisitos";
import type { RelatorioRegularidade } from "./tipos";

export function relatorioSemConsulta(
  entrada: { cnpj: string; modalidadeId: string; codigoNaturezaJuridica?: string },
  motivo: string,
  /** Link oficial de cada requisito (vem da lista de fontes do servidor). */
  linkOficial: (requisitoId: string) => { fonte: string; url: string } | undefined = () =>
    undefined,
  agora: Date = new Date(),
): RelatorioRegularidade {
  const cnpj = somenteDigitos(entrada.cnpj);
  if (!cnpjValido(cnpj)) throw new Error("CNPJ inválido.");
  const modalidade = buscarModalidade(entrada.modalidadeId);
  if (!modalidade) throw new Error("Modalidade de parceria desconhecida.");
  const em = agora.toISOString();

  return {
    parceiro: {
      cnpj,
      ...(entrada.codigoNaturezaJuridica
        ? {
            naturezaJuridica: { codigo: entrada.codigoNaturezaJuridica },
            origem: "inserido_manualmente" as const,
          }
        : {}),
    },
    modalidadeId: modalidade.id,
    modalidade: modalidade.nome,
    geradoEm: em,
    resultados: requisitosAplicaveis(modalidade, entrada.codigoNaturezaJuridica).map(
      ({ requisito, aplicavel }) => {
        const link = linkOficial(requisito.id);
        return {
          requisitoId: requisito.id,
          requisito: requisito.nome,
          fonte: requisito.fonte,
          status: aplicavel ? ("nao_realizada" as const) : ("nao_aplicavel" as const),
          origem: "fonte_oficial" as const,
          resumo: aplicavel ? motivo : "Não se aplica à natureza jurídica informada.",
          verificadoEm: em,
          evidencias:
            aplicavel && link
              ? [
                  {
                    descricao: `Consulta oficial — ${link.fonte}`,
                    url: link.url,
                  },
                ]
              : [],
          requerAnalise: aplicavel,
        };
      },
    ),
  };
}
