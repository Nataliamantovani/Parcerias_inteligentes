/**
 * Testes das regras de permissão do banco (Matriz de permissões v0.2),
 * executados num PostgreSQL local (PGlite) com a migração real.
 * Todos os dados são FICTÍCIOS.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const DIR = join(__dirname, "..", "migrations");

// Simula o que o Supabase já oferece: papéis anon/authenticated e auth.uid().
const SHIM_SUPABASE = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant usage on schema public to anon, authenticated;
`;

const ID = {
  orgaoA: "00000000-0000-4000-8000-0000000000a1",
  orgaoB: "00000000-0000-4000-8000-0000000000b1",
  admPlataforma: "00000000-0000-4000-8000-000000000001",
  admA: "00000000-0000-4000-8000-000000000002",
  formA: "00000000-0000-4000-8000-000000000003",
  gestorA: "00000000-0000-4000-8000-000000000004",
  fiscalA: "00000000-0000-4000-8000-000000000005",
  consultaA: "00000000-0000-4000-8000-000000000006",
  consultaB: "00000000-0000-4000-8000-000000000007",
  admB: "00000000-0000-4000-8000-000000000008",
  controle: "00000000-0000-4000-8000-000000000009",
  parceiro: "00000000-0000-4000-8000-0000000000c1",
};

let db: PGlite;
let instrumentoId: string;

async function como<T>(usuario: string | null, fn: () => Promise<T>): Promise<T> {
  if (usuario) {
    await db.exec(
      `set role authenticated; select set_config('request.jwt.claim.sub', '${usuario}', false);`,
    );
  } else {
    await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false);`);
  }
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  }
}

const linhas = async (sql: string, params: unknown[] = []) => (await db.query(sql, params)).rows;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SHIM_SUPABASE);
  for (const f of readdirSync(DIR).sort()) await db.exec(readFileSync(join(DIR, f), "utf8"));

  // Dados fictícios de partida (inseridos pelo administrador do banco).
  await db.exec(`
    insert into public.orgao (id, sigla, nome) values
      ('${ID.orgaoA}', 'ORG-A', 'Órgão Fictício A'),
      ('${ID.orgaoB}', 'ORG-B', 'Órgão Fictício B');
    insert into public.usuario (id, orgao_id, nome, perfil) values
      ('${ID.admPlataforma}', '${ID.orgaoA}', 'Adm Plataforma', 'adm_plataforma'),
      ('${ID.admA}', '${ID.orgaoA}', 'Adm A', 'adm_orgao'),
      ('${ID.formA}', '${ID.orgaoA}', 'Formalização A', 'consulta'),
      ('${ID.gestorA}', '${ID.orgaoA}', 'Gestor A', 'consulta'),
      ('${ID.fiscalA}', '${ID.orgaoA}', 'Fiscal A', 'consulta'),
      ('${ID.consultaA}', '${ID.orgaoA}', 'Consulta A', 'consulta'),
      ('${ID.consultaB}', '${ID.orgaoB}', 'Consulta B', 'consulta'),
      ('${ID.admB}', '${ID.orgaoB}', 'Adm B', 'adm_orgao'),
      ('${ID.controle}', '${ID.orgaoA}', 'Auditoria Interna', 'controle');
    insert into public.parceiro (id, cnpj, razao_social, natureza_juridica, orgao_id, criado_por)
      values ('${ID.parceiro}', '11222333000181', 'Parceiro Fictício S.A.', '205-4', '${ID.orgaoA}', '${ID.admA}');
  `);
});

describe("Acesso anônimo", () => {
  it("usuário não autenticado não lê nenhuma tabela", async () => {
    await como(null, async () => {
      await expect(db.query("select * from public.parceiro")).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from public.instrumento")).rejects.toThrow(
        /permission denied/,
      );
    });
  });
});

describe("Formalização", () => {
  it("servidor do órgão cadastra instrumento e fica designado para a formalização", async () => {
    instrumentoId = await como(ID.formA, async () => {
      const [r] = await linhas(
        `insert into public.instrumento (orgao_id, parceiro_id, numero, objeto, modalidade_id)
         values ($1, $2, 'ACT 01/2026', 'Objeto fictício', 'act_geral') returning id`,
        [ID.orgaoA, ID.parceiro],
      );
      return (r as { id: string }).id;
    });
    const d = await linhas(
      "select usuario_id, papel from public.designacao where instrumento_id = $1",
      [instrumentoId],
    );
    expect(d).toEqual([{ usuario_id: ID.formA, papel: "formalizacao" }]);
  });

  it("não cadastra instrumento em nome de outro órgão", async () => {
    await como(ID.formA, async () => {
      await expect(
        db.query(
          `insert into public.instrumento (orgao_id, parceiro_id, numero, objeto, modalidade_id)
           values ($1, $2, 'X', 'Y', 'act_geral')`,
          [ID.orgaoB, ID.parceiro],
        ),
      ).rejects.toThrow(/row-level security/);
    });
  });

  it("formalização designada edita; servidor de outro órgão não", async () => {
    await como(ID.formA, () =>
      db.query("update public.instrumento set objeto = 'Objeto revisado' where id = $1", [
        instrumentoId,
      ]),
    );
    const alterou = await como(
      ID.consultaB,
      async () =>
        (
          await db.query("update public.instrumento set objeto = 'invasão' where id = $1", [
            instrumentoId,
          ])
        ).affectedRows,
    );
    expect(alterou).toBe(0);
    const [r] = await linhas("select objeto from public.instrumento where id = $1", [
      instrumentoId,
    ]);
    expect(r).toMatchObject({ objeto: "Objeto revisado" });
  });

  it("formalização não marca acesso restrito", async () => {
    await como(ID.formA, async () => {
      await expect(
        db.query("update public.instrumento set acesso_restrito = true where id = $1", [
          instrumentoId,
        ]),
      ).rejects.toThrow(/gestor designado/);
    });
  });
});

describe("Designações", () => {
  it("administrador do próprio órgão designa gestor e fiscal", async () => {
    await como(ID.admA, () =>
      db.query(
        `insert into public.designacao (instrumento_id, usuario_id, papel) values
           ($1, $2, 'gestor'), ($1, $3, 'fiscal')`,
        [instrumentoId, ID.gestorA, ID.fiscalA],
      ),
    );
  });

  it("administrador de outro órgão não designa", async () => {
    await como(ID.admB, async () => {
      await expect(
        db.query(
          "insert into public.designacao (instrumento_id, usuario_id, papel) values ($1, $2, 'gestor')",
          [instrumentoId, ID.consultaB],
        ),
      ).rejects.toThrow(/row-level security/);
    });
  });

  it("administrador de órgão não cria perfil de controle nem de administrador da plataforma", async () => {
    await como(ID.admA, async () => {
      await expect(
        db.query(
          "insert into public.usuario (id, orgao_id, nome, perfil) values (gen_random_uuid(), $1, 'X', 'controle')",
          [ID.orgaoA],
        ),
      ).rejects.toThrow(/row-level security/);
    });
  });
});

describe("Celebração e gestão", () => {
  it("celebração exige data", async () => {
    await como(ID.formA, async () => {
      await expect(
        db.query("update public.instrumento set situacao = 'vigente' where id = $1", [
          instrumentoId,
        ]),
      ).rejects.toThrow(/data de celebração/);
    });
  });

  it("formalização marca como celebrado e, depois disso, não altera mais", async () => {
    await como(ID.formA, () =>
      db.query(
        "update public.instrumento set situacao = 'vigente', celebrado_em = '2026-11-12' where id = $1",
        [instrumentoId],
      ),
    );
    await como(ID.formA, async () => {
      await expect(
        db.query("update public.instrumento set objeto = 'Z' where id = $1", [instrumentoId]),
      ).rejects.toThrow(/só o gestor designado/);
    });
  });

  it("gestor altera a situação, mas não os dados da formalização", async () => {
    await como(ID.gestorA, () =>
      db.query("update public.instrumento set situacao = 'suspenso' where id = $1", [
        instrumentoId,
      ]),
    );
    await como(ID.gestorA, async () => {
      await expect(
        db.query("update public.instrumento set objeto = 'Z' where id = $1", [instrumentoId]),
      ).rejects.toThrow(/não podem ser alterados após a celebração/);
    });
  });

  it("fiscal não altera o instrumento", async () => {
    const n = await como(
      ID.fiscalA,
      async () =>
        (
          await db.query("update public.instrumento set situacao = 'vigente' where id = $1", [
            instrumentoId,
          ])
        ).affectedRows,
    );
    expect(n).toBe(0);
  });
});

describe("Acesso restrito", () => {
  it("só o gestor marca; depois disso, quem não está designado deixa de ver", async () => {
    await como(ID.gestorA, () =>
      db.query("update public.instrumento set acesso_restrito = true where id = $1", [
        instrumentoId,
      ]),
    );
    const ver = (u: string) =>
      como(
        u,
        async () =>
          (await db.query("select id from public.instrumento where id = $1", [instrumentoId])).rows
            .length,
      );
    expect(await ver(ID.consultaA)).toBe(0);
    expect(await ver(ID.consultaB)).toBe(0);
    expect(await ver(ID.fiscalA)).toBe(1);
    expect(await ver(ID.controle)).toBe(1);
  });
});

describe("Verificações de regularidade", () => {
  it("fiscal designado registra; servidor de outro órgão não registra no instrumento", async () => {
    const inserir = (u: string, orgao: string) =>
      como(u, () =>
        db.query(
          `insert into public.verificacao_regularidade
             (parceiro_id, instrumento_id, requisito_id, requisito, fonte, status, origem, resumo, verificado_em, orgao_id)
           values ($1, $2, 'sancao_ceis', 'CEIS', 'CGU', 'regular', 'fonte_oficial', 'nada consta', now(), $3)`,
          [ID.parceiro, instrumentoId, orgao],
        ),
      );
    await inserir(ID.fiscalA, ID.orgaoA);
    await expect(inserir(ID.consultaB, ID.orgaoB)).rejects.toThrow(/row-level security/);
  });

  it("verificação registrada não pode ser alterada", async () => {
    await como(ID.fiscalA, async () => {
      await expect(
        db.query("update public.verificacao_regularidade set status = 'irregular'"),
      ).rejects.toThrow(/permission denied/);
    });
  });
});

describe("Penalidades", () => {
  let ocorrenciaId: string;

  it("penalidade em apuração fica restrita", async () => {
    // Retira a restrição do instrumento para isolar a regra da penalidade.
    await como(ID.gestorA, () =>
      db.query("update public.instrumento set acesso_restrito = false where id = $1", [
        instrumentoId,
      ]),
    );
    ocorrenciaId = await como(ID.fiscalA, async () => {
      const [r] = await linhas(
        `insert into public.ocorrencia_parceiro (parceiro_id, instrumento_id, tipo, situacao, descricao, orgao_id)
         values ($1, $2, 'penalidade', 'em_apuracao', 'Apuração fictícia', $3) returning id`,
        [ID.parceiro, instrumentoId, ID.orgaoA],
      );
      return (r as { id: string }).id;
    });
    const ver = (u: string) =>
      como(
        u,
        async () => (await db.query("select id from public.ocorrencia_parceiro")).rows.length,
      );
    expect(await ver(ID.consultaB)).toBe(0);
    expect(await ver(ID.controle)).toBe(1);
    expect(await ver(ID.gestorA)).toBe(1);
  });

  it("após a decisão definitiva, todos os órgãos veem", async () => {
    await como(ID.gestorA, () =>
      db.query("update public.ocorrencia_parceiro set situacao = 'definitiva' where id = $1", [
        ocorrenciaId,
      ]),
    );
    const n = await como(
      ID.consultaB,
      async () => (await db.query("select id from public.ocorrencia_parceiro")).rows.length,
    );
    expect(n).toBe(1);
  });

  it("a descrição de uma ocorrência não pode ser editada", async () => {
    await como(ID.gestorA, async () => {
      await expect(
        db.query("update public.ocorrencia_parceiro set descricao = 'outra' where id = $1", [
          ocorrenciaId,
        ]),
      ).rejects.toThrow(/não são editadas/);
    });
  });
});

describe("Nada se apaga e tudo fica no histórico", () => {
  it.each([
    ["instrumento"],
    ["parceiro"],
    ["designacao"],
    ["verificacao_regularidade"],
    ["historico"],
  ])("ninguém apaga registros de %s, nem o administrador da plataforma", async (tabela) => {
    await como(ID.admPlataforma, async () => {
      await expect(db.query(`delete from public.${tabela}`)).rejects.toThrow(/permission denied/);
    });
  });

  it("histórico registra as alterações do instrumento com autor", async () => {
    const h = await linhas(
      "select operacao, por from public.historico where tabela = 'instrumento' and registro_id = $1 order by id",
      [instrumentoId],
    );
    expect(h.length).toBeGreaterThanOrEqual(5);
    expect(h[0]).toMatchObject({ operacao: "INSERT", por: ID.formA });
  });

  it("histórico: o órgão que cadastrou lê; outro órgão não; ninguém altera", async () => {
    const lerInstrumento = (u: string) =>
      como(
        u,
        async () =>
          (
            await db.query("select id from public.historico where registro_id = $1", [
              instrumentoId,
            ])
          ).rows.length,
      );
    expect(await lerInstrumento(ID.consultaA)).toBeGreaterThan(0);
    expect(await lerInstrumento(ID.consultaB)).toBe(0);
    expect(await lerInstrumento(ID.controle)).toBeGreaterThan(0);
    await como(ID.controle, async () => {
      await expect(db.query("update public.historico set operacao = 'X'")).rejects.toThrow(
        /permission denied/,
      );
    });
  });

  it("histórico de penalidade em apuração não aparece para quem não está designado", async () => {
    const ler = (u: string) =>
      como(
        u,
        async () =>
          (await db.query("select id from public.historico where tabela = 'ocorrencia_parceiro'"))
            .rows.length,
      );
    expect(await ler(ID.consultaA)).toBe(0);
    expect(await ler(ID.gestorA)).toBeGreaterThan(0);
  });

  it("histórico de instrumento restrito só aparece para designados e Controle", async () => {
    await como(ID.gestorA, () =>
      db.query("update public.instrumento set acesso_restrito = true where id = $1", [
        instrumentoId,
      ]),
    );
    const ler = (u: string) =>
      como(
        u,
        async () =>
          (
            await db.query("select id from public.historico where instrumento_id = $1", [
              instrumentoId,
            ])
          ).rows.length,
      );
    expect(await ler(ID.consultaA)).toBe(0);
    expect(await ler(ID.fiscalA)).toBeGreaterThan(0);
    await como(ID.gestorA, () =>
      db.query("update public.instrumento set acesso_restrito = false where id = $1", [
        instrumentoId,
      ]),
    );
  });
});

describe("Banco único", () => {
  it("servidor de outro órgão consulta parceiro e instrumento não restrito", async () => {
    await como(ID.consultaB, async () => {
      expect((await db.query("select id from public.parceiro")).rows.length).toBe(1);
      expect((await db.query("select id from public.instrumento")).rows.length).toBe(1);
    });
  });
});
