/**
 * Cliente do Supabase (banco de dados e login) para o NAVEGADOR.
 *
 * O endereço e a chave abaixo são PÚBLICOS por natureza: a chave "publishable"
 * foi feita para ficar no site. Quem protege os dados são as regras de permissão
 * do banco (Row Level Security, ver supabase/migrations). Chaves secretas
 * ("secret" / "service_role") NUNCA devem aparecer neste repositório.
 *
 * Para apontar para outro projeto (ex.: infraestrutura do órgão), defina
 * VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no ambiente de build.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Projeto de PROTÓTIPO (somente dados fictícios), região São Paulo.
const URL_PADRAO = "https://kbhwhtnalymeotxpxgcn.supabase.co";
const CHAVE_PUBLICA_PADRAO = "sb_publishable_WqZkreGdph1hIotitZxNfA_nNduNhfS";

let cliente: SupabaseClient | null = null;

/** Devolve o cliente; só existe no navegador (a sessão fica no armazenamento local). */
export function supabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!cliente) {
    cliente = createClient(
      import.meta.env.VITE_SUPABASE_URL || URL_PADRAO,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || CHAVE_PUBLICA_PADRAO,
      { auth: { persistSession: true, autoRefreshToken: true } },
    );
  }
  return cliente;
}
