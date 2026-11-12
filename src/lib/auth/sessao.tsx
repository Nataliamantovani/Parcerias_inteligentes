/**
 * Sessão do usuário: quem está logado e qual o seu cadastro de servidor
 * (órgão e perfil) na tabela public.usuario.
 *
 * Estar logado não basta para ver dados: sem cadastro ativo em public.usuario,
 * o banco não devolve nada (migração "somente_usuarios_cadastrados").
 */
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/lib/supabase/cliente";

export type Perfil = "consulta" | "controle" | "adm_orgao" | "adm_plataforma";

export const ROTULO_PERFIL: Record<Perfil, string> = {
  consulta: "Consulta",
  controle: "Controle (auditoria interna / corregedoria)",
  adm_orgao: "Administrador do órgão",
  adm_plataforma: "Administrador da plataforma",
};

export type CadastroServidor = {
  id: string;
  nome: string;
  perfil: Perfil;
  orgao: { sigla: string; nome: string } | null;
};

type EstadoSessao = {
  /** Verdadeiro até a primeira leitura da sessão no navegador terminar. */
  carregando: boolean;
  sessao: Session | null;
  /** Cadastro de servidor; null se logado sem cadastro ativo. */
  cadastro: CadastroServidor | null;
  entrar: (email: string, senha: string) => Promise<string | null>;
  sair: () => Promise<void>;
};

const Contexto = createContext<EstadoSessao | null>(null);

async function lerCadastro(id: string): Promise<CadastroServidor | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("usuario")
    .select("id, nome, perfil, orgao:orgao_id ( sigla, nome )")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as CadastroServidor;
}

function traduzirErro(mensagem: string): string {
  if (/invalid login credentials/i.test(mensagem)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(mensagem)) return "E-mail ainda não confirmado.";
  if (/fetch|network/i.test(mensagem))
    return "Não foi possível conectar ao servidor de login. Verifique a conexão.";
  if (/rate limit/i.test(mensagem)) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Não foi possível entrar. Tente novamente.";
}

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [sessao, setSessao] = useState<Session | null>(null);
  const [cadastro, setCadastro] = useState<CadastroServidor | null>(null);

  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    let ativo = true;

    const aplicar = async (s: Session | null) => {
      const c = s ? await lerCadastro(s.user.id) : null;
      if (!ativo) return;
      setSessao(s);
      setCadastro(c);
      setCarregando(false);
    };

    sb.auth.getSession().then(({ data }) => aplicar(data.session));
    const { data: inscricao } = sb.auth.onAuthStateChange((_evento, s) => {
      // Evita chamar o banco dentro do callback do Supabase (recomendação da biblioteca).
      setTimeout(() => aplicar(s), 0);
    });
    return () => {
      ativo = false;
      inscricao.subscription.unsubscribe();
    };
  }, []);

  const entrar = async (email: string, senha: string) => {
    const sb = supabase();
    if (!sb) return "Login disponível apenas no navegador.";
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password: senha });
      return error ? traduzirErro(error.message) : null;
    } catch (e) {
      return traduzirErro(e instanceof Error ? e.message : "");
    }
  };

  const sair = async () => {
    await supabase()?.auth.signOut();
  };

  return (
    <Contexto.Provider value={{ carregando, sessao, cadastro, entrar, sair }}>
      {children}
    </Contexto.Provider>
  );
}

export function useSessao(): EstadoSessao {
  const c = useContext(Contexto);
  if (!c) throw new Error("useSessao precisa estar dentro de <ProvedorSessao>.");
  return c;
}
