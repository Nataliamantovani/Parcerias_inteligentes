/**
 * Testes dos conectores SEM acesso à rede: as respostas da API são simuladas
 * (fixtures sintéticas no formato documentado da API do Portal da Transparência).
 * Estes testes provam o tratamento das respostas; a chamada real à API precisa
 * ser validada com uma chave verdadeira (ver docs/habilitacao.md).
 */
import { describe, expect, it, vi } from "vitest";

import { conectorCGU, normalizarData } from "../conectores/cgu";
import { conectorCndt } from "../conectores/sem-consulta-automatica";
import type { ContextoConsulta } from "../conectores/tipos";
import { verificarParceiro } from "../servico/verificar";

const CNPJ_TESTE = "11222333000181";
const AGORA = new Date("2026-11-12T15:00:00Z");
const REQ_CGU = [
  { id: "sancao_ceis", nome: "CEIS" },
  { id: "sancao_cnep", nome: "CNEP" },
];

function resposta(status: number, corpo: unknown): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function contexto(
  fetchFake: (url: string) => Promise<Response>,
  env: Record<string, string> = { PORTAL_TRANSPARENCIA_API_KEY: "chave-de-teste" },
): ContextoConsulta & { chamadas: { url: string; headers: Record<string, string> }[] } {
  const chamadas: { url: string; headers: Record<string, string> }[] = [];
  return {
    chamadas,
    fetch: (async (url: string, init?: RequestInit) => {
      chamadas.push({ url, headers: (init?.headers ?? {}) as Record<string, string> });
      return fetchFake(url);
    }) as typeof fetch,
    env: (n) => env[n],
    agora: () => AGORA,
  };
}

describe("normalizarData", () => {
  it("aceita dd/mm/aaaa e aaaa-mm-dd", () => {
    expect(normalizarData("05/03/2024")).toBe("2024-03-05");
    expect(normalizarData("2024-03-05T00:00:00")).toBe("2024-03-05");
    expect(normalizarData("Sem informação")).toBeUndefined();
  });
});

describe("Conector CGU", () => {
  it("sem chave configurada: não consulta e devolve 'não realizada' (nunca regular)", async () => {
    const fetchFake = vi.fn();
    const ctx = contexto(fetchFake, {});
    const r = await conectorCGU.consultar(CNPJ_TESTE, REQ_CGU, ctx);
    expect(fetchFake).not.toHaveBeenCalled();
    expect(r.map((x) => x.status)).toEqual(["nao_realizada", "nao_realizada"]);
  });

  it("envia a chave no cabeçalho 'chave-api-dados' e o CNPJ no parâmetro certo", async () => {
    const ctx = contexto(async () => resposta(200, []));
    await conectorCGU.consultar(
      CNPJ_TESTE,
      [...REQ_CGU, { id: "impedimento_cepim", nome: "CEPIM" }],
      ctx,
    );
    expect(ctx.chamadas.map((c) => c.url)).toEqual([
      `https://api.portaldatransparencia.gov.br/api-de-dados/ceis?codigoSancionado=${CNPJ_TESTE}&pagina=1`,
      `https://api.portaldatransparencia.gov.br/api-de-dados/cnep?codigoSancionado=${CNPJ_TESTE}&pagina=1`,
      `https://api.portaldatransparencia.gov.br/api-de-dados/cepim?cnpjSancionado=${CNPJ_TESTE}&pagina=1`,
    ]);
    expect(ctx.chamadas[0].headers["chave-api-dados"]).toBe("chave-de-teste");
  });

  it("lista vazia = nada consta = regular, com evidência e origem oficial", async () => {
    const r = await conectorCGU.consultar(
      CNPJ_TESTE,
      REQ_CGU,
      contexto(async () => resposta(200, [])),
    );
    expect(r[0].status).toBe("regular");
    expect(r[0].origem).toBe("fonte_oficial");
    expect(r[0].evidencias.some((e) => e.url)).toBe(true);
  });

  it("sanção vigente = irregularidade identificada, que requer análise", async () => {
    const sancao = {
      id: 987,
      dataInicioSancao: "01/01/2025",
      dataFimSancao: "01/01/2030",
      tipoSancao: { descricaoResumida: "Impedimento" },
      orgaoSancionador: { nome: "Órgão Fictício" },
    };
    const r = await conectorCGU.consultar(
      CNPJ_TESTE,
      REQ_CGU.slice(0, 1),
      contexto(async () => resposta(200, [sancao])),
    );
    expect(r[0].status).toBe("irregular");
    expect(r[0].requerAnalise).toBe(true);
    expect(r[0].detalhes?.[0]).toMatchObject({
      id: "987",
      tipoSancao: "Impedimento",
      orgaoSancionador: "Órgão Fictício",
      dataFim: "2030-01-01",
    });
  });

  it("só sanções encerradas = análise humana, não irregularidade", async () => {
    const encerrada = { id: 1, dataInicioSancao: "01/01/2020", dataFimSancao: "01/01/2021" };
    const r = await conectorCGU.consultar(
      CNPJ_TESTE,
      REQ_CGU.slice(0, 1),
      contexto(async () => resposta(200, [encerrada])),
    );
    expect(r[0].status).toBe("analise_humana");
  });

  it.each([
    [500, "HTTP 500"],
    [401, "chave de acesso recusada"],
    [429, "limite de requisições"],
  ])("HTTP %i = consulta indisponível, nunca irregular", async (status, trecho) => {
    const r = await conectorCGU.consultar(
      CNPJ_TESTE,
      REQ_CGU.slice(0, 1),
      contexto(async () => resposta(status, { erro: true })),
    );
    expect(r[0].status).toBe("indisponivel");
    expect(r[0].resumo).toContain(trecho);
    expect(r[0].resumo).toContain("não indica irregularidade");
  });

  it("falha de rede = consulta indisponível", async () => {
    const r = await conectorCGU.consultar(
      CNPJ_TESTE,
      REQ_CGU.slice(0, 1),
      contexto(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    expect(r[0].status).toBe("indisponivel");
  });

  it("resposta fora do formato esperado = indisponível", async () => {
    const r = await conectorCGU.consultar(
      CNPJ_TESTE,
      REQ_CGU.slice(0, 1),
      contexto(async () => resposta(200, { inesperado: true })),
    );
    expect(r[0].status).toBe("indisponivel");
  });
});

describe("Conectores sem consulta automática", () => {
  it("verificação assistida devolve 'não realizada' com o link oficial", async () => {
    const r = await conectorCndt.consultar(
      CNPJ_TESTE,
      [{ id: "regularidade_trabalhista", nome: "CNDT" }],
      contexto(async () => resposta(200, [])),
    );
    expect(r[0].status).toBe("nao_realizada");
    expect(r[0].evidencias[0].url).toMatch(/^https:\/\/.*tst\.jus\.br/);
  });
});

describe("Serviço de verificação", () => {
  it("rejeita CNPJ inválido", async () => {
    await expect(
      verificarParceiro(
        { cnpj: "123", modalidadeId: "act_geral" },
        contexto(async () => resposta(200, [])),
      ),
    ).rejects.toThrow("CNPJ inválido");
  });

  it("uma fonte fora do ar não derruba as outras e não gera irregularidade", async () => {
    const ctx = contexto(async (url) =>
      url.includes("/ceis") ? resposta(503, {}) : resposta(200, []),
    );
    const r = await verificarParceiro({ cnpj: CNPJ_TESTE, modalidadeId: "act_geral" }, ctx);
    const porId = Object.fromEntries(r.resultados.map((x) => [x.requisitoId, x.status]));
    expect(porId.sancao_ceis).toBe("indisponivel");
    expect(porId.sancao_cnep).toBe("regular");
    expect(porId.regularidade_trabalhista).toBe("nao_realizada");
    expect(Object.values(porId)).not.toContain("irregular");
  });

  it("CEPIM aparece como não aplicável para empresa (natureza jurídica fora do grupo 3)", async () => {
    const r = await verificarParceiro(
      { cnpj: CNPJ_TESTE, modalidadeId: "parceria_osc", codigoNaturezaJuridica: "206-2" },
      contexto(async () => resposta(200, [])),
    );
    expect(r.resultados.find((x) => x.requisitoId === "impedimento_cepim")?.status).toBe(
      "nao_aplicavel",
    );
  });

  it("mantém a ordem dos requisitos definida na modalidade", async () => {
    const r = await verificarParceiro(
      { cnpj: CNPJ_TESTE, modalidadeId: "act_instituicao_financeira" },
      contexto(async () => resposta(200, [])),
    );
    expect(r.resultados.map((x) => x.requisitoId)[0]).toBe("situacao_cadastral");
    expect(r.resultados.at(-1)?.requisitoId).toBe("autorizacao_bcb");
  });
});
