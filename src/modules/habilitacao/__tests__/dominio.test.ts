import { describe, expect, it } from "vitest";

import { relatorioSemConsulta } from "../dominio/checklist";
import { cnpjValido, formatarCnpj } from "../dominio/cnpj";
import { aplicarValidade, consolidar } from "../dominio/consolidacao";
import {
  MODALIDADES,
  REQUISITOS,
  buscarModalidade,
  requisitosAplicaveis,
} from "../dominio/requisitos";
import type { ResultadoVerificacao } from "../dominio/tipos";

// CNPJ fictício com dígitos verificadores válidos, usado só em testes.
const CNPJ_TESTE = "11222333000181";

function resultado(parcial: Partial<ResultadoVerificacao>): ResultadoVerificacao {
  return {
    requisitoId: "x",
    requisito: "X",
    fonte: "Teste",
    status: "regular",
    origem: "fonte_oficial",
    resumo: "ok",
    verificadoEm: "2026-11-12T12:00:00.000Z",
    evidencias: [],
    requerAnalise: false,
    ...parcial,
  };
}

describe("CNPJ", () => {
  it("aceita CNPJ com dígitos verificadores corretos, com ou sem pontuação", () => {
    expect(cnpjValido(CNPJ_TESTE)).toBe(true);
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
  });
  it("rejeita dígito verificador errado, tamanho errado e sequência repetida", () => {
    expect(cnpjValido("11222333000182")).toBe(false);
    expect(cnpjValido("1122233300018")).toBe(false);
    expect(cnpjValido("00000000000000")).toBe(false);
  });
  it("formata no padrão 00.000.000/0000-00", () => {
    expect(formatarCnpj(CNPJ_TESTE)).toBe("11.222.333/0001-81");
  });
});

describe("Catálogo de requisitos", () => {
  it("toda modalidade referencia apenas requisitos existentes", () => {
    for (const m of MODALIDADES)
      for (const id of m.requisitos) expect(REQUISITOS[id]).toBeDefined();
  });
  it("não presume base legal: todas começam como 'a definir'", () => {
    for (const r of Object.values(REQUISITOS)) expect(r.baseLegal).toMatch(/A definir/);
  });
  it("CEPIM só se aplica a entidades sem fins lucrativos (natureza jurídica grupo 3)", () => {
    const osc = buscarModalidade("parceria_osc")!;
    const cepim = (codigo?: string) =>
      requisitosAplicaveis(osc, codigo).find((i) => i.requisito.id === "impedimento_cepim")!
        .aplicavel;
    expect(cepim("399-9")).toBe(true);
    expect(cepim("206-2")).toBe(false);
    expect(cepim(undefined)).toBe(true); // desconhecida: na dúvida, verifica
  });
});

describe("Consolidação", () => {
  const hoje = "2026-11-12";

  it("marca como vencido um resultado regular com validade passada", () => {
    const r = aplicarValidade(resultado({ validade: "2026-11-01" }), hoje);
    expect(r.status).toBe("vencido");
    expect(r.requerAnalise).toBe(true);
  });

  it("nunca transforma consulta indisponível em regular ou irregular", () => {
    const r = aplicarValidade(resultado({ status: "indisponivel", validade: "2030-01-01" }), hoje);
    expect(r.status).toBe("indisponivel");
  });

  it("não afirma regularidade quando há consulta não realizada ou indisponível", () => {
    const s = consolidar(
      [resultado({}), resultado({ requisitoId: "y", status: "indisponivel" })],
      hoje,
    );
    expect(s.todosVerificadosRegulares).toBe(false);
    expect(s.sintese).toMatch(/Não presuma regularidade/);
  });

  it("registro manual regular não conta como verificação em fonte oficial", () => {
    const s = consolidar([resultado({ origem: "inserido_manualmente" })], hoje);
    expect(s.todosVerificadosRegulares).toBe(false);
  });

  it("restrição identificada pede análise e nunca usa a palavra 'habilitado'", () => {
    const s = consolidar([resultado({ status: "irregular", requerAnalise: true })], hoje);
    expect(s.sintese).toMatch(/Requer análise/);
    expect(s.sintese.toLowerCase()).not.toContain("habilitado");
  });

  it("pendências vêm ordenadas: irregular antes de não realizada", () => {
    const s = consolidar(
      [
        resultado({ requisitoId: "a", status: "nao_realizada" }),
        resultado({ requisitoId: "b", status: "irregular" }),
      ],
      hoje,
    );
    expect(s.pendencias.map((p) => p.requisitoId)).toEqual(["b", "a"]);
  });
});

describe("Lista de verificação sem consulta", () => {
  it("todos os requisitos aplicáveis ficam como 'não realizada', nenhum como regular", () => {
    const r = relatorioSemConsulta(
      { cnpj: CNPJ_TESTE, modalidadeId: "act_instituicao_financeira" },
      "desativado",
    );
    expect(r.resultados.length).toBeGreaterThan(0);
    expect(r.resultados.every((x) => x.status === "nao_realizada")).toBe(true);
  });
});
