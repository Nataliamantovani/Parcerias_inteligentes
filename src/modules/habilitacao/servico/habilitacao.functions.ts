/**
 * Funções de servidor do módulo Habilitação e Regularidade.
 * O navegador chama estas funções; as consultas externas e a leitura de
 * credenciais acontecem apenas no servidor.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { CONECTORES } from "../conectores/registro";
import { MODALIDADES } from "../dominio/requisitos";
import { consultasAtivas, contextoServidor } from "./contexto.server";
import { ErroDeEntrada, verificarParceiro } from "./verificar";

/** Situação de ativação de cada fonte, para a tela "Fontes e ativação". Não expõe credenciais. */
export const obterSituacaoFontes = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = contextoServidor();
  return {
    consultasAtivas: consultasAtivas(),
    fontes: CONECTORES.map((c) => ({ ...c.info, configurado: c.configurado(ctx) })),
  };
});

const entradaVerificacao = z.object({
  cnpj: z.string().min(14).max(18),
  modalidadeId: z.enum(MODALIDADES.map((m) => m.id) as [string, ...string[]]),
  codigoNaturezaJuridica: z
    .string()
    .regex(/^\d{3}-?\d$/, "Use o formato 000-0")
    .optional(),
});

export const verificarRegularidade = createServerFn({ method: "POST" })
  .validator(entradaVerificacao)
  .handler(async ({ data }) => {
    if (!consultasAtivas()) {
      return {
        ok: false as const,
        motivo:
          "As consultas externas estão desativadas neste ambiente. Elas serão ativadas quando houver login e a autorização do órgão (variável HABILITACAO_CONSULTAS_ATIVAS).",
      };
    }
    try {
      const relatorio = await verificarParceiro(data, contextoServidor());
      // Trilha mínima até existir banco de dados: registro estruturado no log do servidor.
      console.info(
        JSON.stringify({
          evento: "habilitacao.verificacao",
          cnpj: relatorio.parceiro.cnpj,
          modalidade: relatorio.modalidadeId,
          em: relatorio.geradoEm,
          status: relatorio.resultados.map((r) => [r.requisitoId, r.status]),
        }),
      );
      return { ok: true as const, relatorio };
    } catch (e) {
      if (e instanceof ErroDeEntrada) return { ok: false as const, motivo: e.message };
      throw e;
    }
  });
