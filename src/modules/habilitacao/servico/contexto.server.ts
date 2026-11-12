import process from "node:process";

import type { ContextoConsulta } from "../conectores/tipos";

/**
 * Contexto de consulta do servidor. Lê variáveis de ambiente no momento da
 * requisição (exigência do Cloudflare Workers; ver src/lib/config.server.ts).
 * Este arquivo .server.ts nunca é enviado ao navegador.
 */
export function contextoServidor(): ContextoConsulta {
  return {
    fetch: (...args) => fetch(...args),
    env: (nome) => process.env[nome],
    agora: () => new Date(),
  };
}

/**
 * Trava de segurança: as consultas externas só rodam quando o administrador
 * do ambiente define HABILITACAO_CONSULTAS_ATIVAS=true. Enquanto não houver
 * login (ver docs do modelo de permissões), o site público mantém a trava
 * desligada para que ninguém use o SIGACT como intermediário de consultas.
 */
export function consultasAtivas(): boolean {
  return process.env.HABILITACAO_CONSULTAS_ATIVAS === "true";
}
