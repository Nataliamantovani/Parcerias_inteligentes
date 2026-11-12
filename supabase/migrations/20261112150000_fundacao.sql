-- =============================================================================
-- SIGACT IA — Fundação do banco de dados
-- Implementa o "Modelo de Perfis e Permissões" v0.2 (12/11/2026).
--
-- Princípios:
--   1. Leitura ampla: qualquer usuário autenticado lê, exceto registros restritos.
--   2. Escrita só por quem está designado no instrumento, para o papel exigido.
--   3. Nada se apaga: não há DELETE para nenhum usuário da aplicação.
--   4. Toda alteração é registrada na tabela historico (só INSERT).
--   5. As regras valem DENTRO do banco (Row Level Security), não só na tela.
--
-- Compatível com Supabase (usa auth.uid() e o papel "authenticated").
-- Usuários anônimos (papel "anon") não acessam nenhuma tabela.
-- =============================================================================

create schema if not exists app;

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
create type public.perfil_global as enum (
  'consulta',          -- todo servidor autenticado
  'controle',          -- auditoria interna e corregedoria: vê também o restrito
  'adm_orgao',         -- cadastra usuários e designa papéis no próprio órgão
  'adm_plataforma'     -- configura o sistema e cadastra órgãos
);

create type public.papel_instrumento as enum ('formalizacao', 'gestor', 'fiscal');

create type public.situacao_instrumento as enum (
  'em_formalizacao', 'vigente', 'suspenso', 'prorrogado', 'encerrado', 'rescindido'
);

create type public.status_verificacao as enum (
  'regular', 'irregular', 'vencido', 'indisponivel', 'nao_realizada', 'nao_aplicavel', 'analise_humana'
);

create type public.origem_resultado as enum ('fonte_oficial', 'inserido_manualmente');

create type public.tipo_ocorrencia as enum ('merito', 'penalidade');

create type public.situacao_ocorrencia as enum ('em_apuracao', 'definitiva', 'revogada');

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------
create table public.orgao (
  id         uuid primary key default gen_random_uuid(),
  sigla      text not null unique,
  nome       text not null,
  criado_em  timestamptz not null default now()
);

create table public.usuario (
  id         uuid primary key,                     -- = auth.users.id
  orgao_id   uuid not null references public.orgao(id),
  nome       text not null,
  perfil     public.perfil_global not null default 'consulta',
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

create table public.parceiro (
  id                 uuid primary key default gen_random_uuid(),
  cnpj               char(14) not null unique check (cnpj ~ '^[0-9]{14}$'),
  razao_social       text not null,
  natureza_juridica  text check (natureza_juridica ~ '^[0-9]{3}-[0-9]$'),
  orgao_id           uuid not null references public.orgao(id),   -- órgão que cadastrou
  criado_por         uuid not null default auth.uid() references public.usuario(id),
  criado_em          timestamptz not null default now()
);

create table public.instrumento (
  id               uuid primary key default gen_random_uuid(),
  orgao_id         uuid not null references public.orgao(id),
  parceiro_id      uuid not null references public.parceiro(id),
  numero           text not null,
  objeto           text not null,
  modalidade_id    text not null,
  situacao         public.situacao_instrumento not null default 'em_formalizacao',
  vigencia_inicio  date,
  vigencia_fim     date,
  celebrado_em     date,
  acesso_restrito  boolean not null default false,
  criado_por       uuid not null default auth.uid() references public.usuario(id),
  criado_em        timestamptz not null default now(),
  unique (orgao_id, numero),
  check (vigencia_fim is null or vigencia_inicio is null or vigencia_fim >= vigencia_inicio)
);

create table public.designacao (
  id              uuid primary key default gen_random_uuid(),
  instrumento_id  uuid not null references public.instrumento(id),
  usuario_id      uuid not null references public.usuario(id),
  papel           public.papel_instrumento not null,
  inicio          date not null default current_date,
  fim             date,
  designado_por   uuid default auth.uid() references public.usuario(id),
  criado_em       timestamptz not null default now(),
  check (fim is null or fim >= inicio)
);

-- Resultado de cada verificação de habilitação/regularidade (módulo Habilitação).
-- Só aceita INSERT: correção = novo registro.
create table public.verificacao_regularidade (
  id               uuid primary key default gen_random_uuid(),
  parceiro_id      uuid not null references public.parceiro(id),
  instrumento_id   uuid references public.instrumento(id),
  requisito_id     text not null,
  requisito        text not null,
  fonte            text not null,
  status           public.status_verificacao not null,
  origem           public.origem_resultado not null,
  resumo           text not null,
  verificado_em    timestamptz not null,
  validade         date,
  evidencias       jsonb not null default '[]'::jsonb,
  detalhes         jsonb,
  orgao_id         uuid not null references public.orgao(id),
  registrado_por   uuid not null default auth.uid() references public.usuario(id),
  registrado_em    timestamptz not null default now()
);

-- Méritos e penalidades do parceiro (banco único entre órgãos).
-- Penalidade "em_apuracao" é restrita até a decisão definitiva.
create table public.ocorrencia_parceiro (
  id               uuid primary key default gen_random_uuid(),
  parceiro_id      uuid not null references public.parceiro(id),
  instrumento_id   uuid not null references public.instrumento(id),
  tipo             public.tipo_ocorrencia not null,
  situacao         public.situacao_ocorrencia not null,
  descricao        text not null,
  processo         text,
  orgao_id         uuid not null references public.orgao(id),
  registrado_por   uuid not null default auth.uid() references public.usuario(id),
  registrado_em    timestamptz not null default now(),
  check (tipo = 'penalidade' or situacao = 'definitiva')
);

-- Trilha de auditoria: preenchida só por gatilho; ninguém altera nem apaga.
create table public.historico (
  id             bigint generated always as identity primary key,
  tabela         text not null,
  registro_id    uuid not null,
  orgao_id       uuid,          -- órgão que cadastrou o registro (define quem lê o histórico)
  instrumento_id uuid,          -- instrumento relacionado, para respeitar o acesso restrito
  operacao    text not null,
  antes       jsonb,
  depois      jsonb,
  por         uuid,
  em          timestamptz not null default now()
);

create index on public.designacao (instrumento_id, usuario_id);
create index on public.instrumento (parceiro_id);
create index on public.verificacao_regularidade (parceiro_id, verificado_em desc);
create index on public.ocorrencia_parceiro (parceiro_id);
create index on public.historico (tabela, registro_id);

-- -----------------------------------------------------------------------------
-- Funções de apoio às regras (security definer: leem as tabelas sem passar pelo RLS,
-- para evitar recursão; não alteram nada).
-- -----------------------------------------------------------------------------
create function app.meu_perfil() returns public.perfil_global
language sql stable security definer set search_path = public as $$
  select perfil from public.usuario where id = auth.uid() and ativo
$$;

create function app.meu_orgao() returns uuid
language sql stable security definer set search_path = public as $$
  select orgao_id from public.usuario where id = auth.uid() and ativo
$$;

create function app.e_controle() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(app.meu_perfil() = 'controle', false)
$$;

create function app.e_adm_plataforma() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(app.meu_perfil() = 'adm_plataforma', false)
$$;

create function app.e_adm_do_orgao(p_orgao uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(app.meu_perfil() = 'adm_orgao' and app.meu_orgao() = p_orgao, false)
$$;

-- Designação vigente hoje, em qualquer dos papéis informados.
create function app.e_designado(p_instrumento uuid, p_papeis public.papel_instrumento[])
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.designacao d
    join public.usuario u on u.id = d.usuario_id and u.ativo
    where d.instrumento_id = p_instrumento
      and d.usuario_id = auth.uid()
      and d.papel = any (p_papeis)
      and d.inicio <= current_date
      and (d.fim is null or d.fim >= current_date)
  )
$$;

create function app.pode_ver_restrito(p_instrumento uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select app.e_controle()
      or (p_instrumento is not null
          and app.e_designado(p_instrumento, array['formalizacao','gestor','fiscal']::public.papel_instrumento[]))
$$;

create function app.instrumento_restrito(p_instrumento uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select acesso_restrito from public.instrumento where id = p_instrumento), false)
$$;

-- -----------------------------------------------------------------------------
-- Gatilhos
-- -----------------------------------------------------------------------------

-- Auditoria genérica.
create function app.registrar_historico() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  linha jsonb := to_jsonb(coalesce(new, old));
  v_instrumento uuid;
  v_orgao uuid;
begin
  if tg_table_name = 'orgao' then
    v_orgao := (linha ->> 'id')::uuid;
  elsif tg_table_name = 'instrumento' then
    v_instrumento := (linha ->> 'id')::uuid;
    v_orgao := (linha ->> 'orgao_id')::uuid;
  else
    v_instrumento := (linha ->> 'instrumento_id')::uuid;
    v_orgao := coalesce(
      (linha ->> 'orgao_id')::uuid,
      (select i.orgao_id from public.instrumento i where i.id = v_instrumento)
    );
  end if;

  insert into public.historico (tabela, registro_id, orgao_id, instrumento_id, operacao, antes, depois, por)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    v_orgao,
    v_instrumento,
    tg_op,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end,
    auth.uid()
  );
  return coalesce(new, old);
end $$;

-- Quem cadastra o instrumento fica designado para a formalização.
create function app.designar_formalizador() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    insert into public.designacao (instrumento_id, usuario_id, papel, designado_por)
    values (new.id, auth.uid(), 'formalizacao', auth.uid());
  end if;
  return new;
end $$;

-- Cada papel só altera o que lhe cabe (Matriz de permissões).
create function app.validar_alteracao_instrumento() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  e_form   boolean := app.e_designado(old.id, array['formalizacao']::public.papel_instrumento[]);
  e_gestor boolean := app.e_designado(old.id, array['gestor']::public.papel_instrumento[]);
begin
  if auth.uid() is null then return new; end if;  -- manutenção pelo administrador do banco

  if new.id <> old.id or new.orgao_id <> old.orgao_id or new.criado_por <> old.criado_por
     or new.criado_em <> old.criado_em then
    raise exception 'Campos de identificação do instrumento não podem ser alterados.';
  end if;

  if old.situacao = 'em_formalizacao' then
    if not e_form then
      raise exception 'Só o servidor de formalização designado altera o instrumento em formalização.';
    end if;
    if new.acesso_restrito <> old.acesso_restrito then
      raise exception 'Só o gestor designado marca ou desmarca o acesso restrito.';
    end if;
    -- A formalização só pode concluir a etapa marcando como celebrado (vigente).
    if new.situacao not in ('em_formalizacao', 'vigente') then
      raise exception 'Na formalização, a situação só pode passar a vigente (celebrado).';
    end if;
    if new.situacao = 'vigente' and new.celebrado_em is null then
      raise exception 'Informe a data de celebração ao marcar o instrumento como celebrado.';
    end if;
    return new;
  end if;

  -- Após a celebração, só o gestor altera, e somente situação, vigência e acesso restrito.
  if not e_gestor then
    raise exception 'Após a celebração, só o gestor designado altera o instrumento.';
  end if;
  if new.parceiro_id <> old.parceiro_id or new.numero <> old.numero or new.objeto <> old.objeto
     or new.modalidade_id <> old.modalidade_id or new.celebrado_em is distinct from old.celebrado_em then
    raise exception 'Dados da formalização não podem ser alterados após a celebração.';
  end if;
  if new.situacao = 'em_formalizacao' then
    raise exception 'O instrumento celebrado não volta para formalização.';
  end if;
  return new;
end $$;

-- Ocorrência: só a situação pode mudar (ex.: em apuração -> definitiva).
create function app.validar_alteracao_ocorrencia() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if (to_jsonb(new) - 'situacao') <> (to_jsonb(old) - 'situacao') then
    raise exception 'Ocorrências não são editadas; só a situação pode mudar. Registre uma nova ocorrência para corrigir.';
  end if;
  if old.situacao <> 'em_apuracao' then
    raise exception 'Ocorrência já decidida não muda de situação.';
  end if;
  return new;
end $$;

create trigger instrumento_formalizador after insert on public.instrumento
  for each row execute function app.designar_formalizador();
create trigger instrumento_regras before update on public.instrumento
  for each row execute function app.validar_alteracao_instrumento();
create trigger ocorrencia_regras before update on public.ocorrencia_parceiro
  for each row execute function app.validar_alteracao_ocorrencia();

create trigger historico_orgao after insert or update or delete on public.orgao
  for each row execute function app.registrar_historico();
create trigger historico_usuario after insert or update or delete on public.usuario
  for each row execute function app.registrar_historico();
create trigger historico_parceiro after insert or update or delete on public.parceiro
  for each row execute function app.registrar_historico();
create trigger historico_instrumento after insert or update or delete on public.instrumento
  for each row execute function app.registrar_historico();
create trigger historico_designacao after insert or update or delete on public.designacao
  for each row execute function app.registrar_historico();
create trigger historico_verificacao after insert or update or delete on public.verificacao_regularidade
  for each row execute function app.registrar_historico();
create trigger historico_ocorrencia after insert or update or delete on public.ocorrencia_parceiro
  for each row execute function app.registrar_historico();

-- -----------------------------------------------------------------------------
-- Permissões e Row Level Security
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on schema app from public;
grant usage on schema app to authenticated;
grant execute on all functions in schema app to authenticated;

grant select on all tables in schema public to authenticated;
grant insert, update on public.orgao, public.usuario, public.parceiro, public.instrumento,
  public.designacao to authenticated;
grant insert on public.verificacao_regularidade to authenticated;
grant insert, update on public.ocorrencia_parceiro to authenticated;
-- Nenhum DELETE/TRUNCATE é concedido: nada se apaga.

alter table public.orgao enable row level security;
alter table public.usuario enable row level security;
alter table public.parceiro enable row level security;
alter table public.instrumento enable row level security;
alter table public.designacao enable row level security;
alter table public.verificacao_regularidade enable row level security;
alter table public.ocorrencia_parceiro enable row level security;
alter table public.historico enable row level security;

-- Órgãos
create policy orgao_ler on public.orgao for select to authenticated using (true);
create policy orgao_criar on public.orgao for insert to authenticated with check (app.e_adm_plataforma());
create policy orgao_editar on public.orgao for update to authenticated
  using (app.e_adm_plataforma()) with check (app.e_adm_plataforma());

-- Usuários
create policy usuario_ler on public.usuario for select to authenticated using (true);
create policy usuario_criar on public.usuario for insert to authenticated with check (
  app.e_adm_plataforma()
  or (app.e_adm_do_orgao(orgao_id) and perfil in ('consulta', 'adm_orgao'))
);
create policy usuario_editar on public.usuario for update to authenticated
  using (app.e_adm_plataforma() or app.e_adm_do_orgao(orgao_id))
  with check (
    app.e_adm_plataforma()
    or (app.e_adm_do_orgao(orgao_id) and perfil in ('consulta', 'adm_orgao'))
  );

-- Parceiros (banco único: todos leem)
create policy parceiro_ler on public.parceiro for select to authenticated using (true);
create policy parceiro_criar on public.parceiro for insert to authenticated with check (
  orgao_id = app.meu_orgao() and criado_por = auth.uid()
);
create policy parceiro_editar on public.parceiro for update to authenticated
  using (app.e_adm_plataforma()) with check (app.e_adm_plataforma());

-- Instrumentos
create policy instrumento_ler on public.instrumento for select to authenticated using (
  not acesso_restrito or app.pode_ver_restrito(id)
);
create policy instrumento_criar on public.instrumento for insert to authenticated with check (
  orgao_id = app.meu_orgao() and criado_por = auth.uid() and situacao = 'em_formalizacao'
  and not acesso_restrito
);
create policy instrumento_editar on public.instrumento for update to authenticated
  using (app.e_designado(id, array['formalizacao','gestor']::public.papel_instrumento[]))
  with check (app.e_designado(id, array['formalizacao','gestor']::public.papel_instrumento[]));

-- Designações
create policy designacao_ler on public.designacao for select to authenticated using (true);
create policy designacao_criar on public.designacao for insert to authenticated with check (
  app.e_adm_do_orgao((select orgao_id from public.instrumento i where i.id = instrumento_id))
);
create policy designacao_encerrar on public.designacao for update to authenticated
  using (app.e_adm_do_orgao((select orgao_id from public.instrumento i where i.id = instrumento_id)))
  with check (app.e_adm_do_orgao((select orgao_id from public.instrumento i where i.id = instrumento_id)));

-- Verificações de regularidade
create policy verificacao_ler on public.verificacao_regularidade for select to authenticated using (
  instrumento_id is null or not app.instrumento_restrito(instrumento_id)
  or app.pode_ver_restrito(instrumento_id)
);
create policy verificacao_registrar on public.verificacao_regularidade for insert to authenticated
with check (
  registrado_por = auth.uid() and orgao_id = app.meu_orgao()
  and (
    instrumento_id is null
    or app.e_designado(instrumento_id, array['formalizacao','gestor','fiscal']::public.papel_instrumento[])
  )
);

-- Méritos e penalidades
create policy ocorrencia_ler on public.ocorrencia_parceiro for select to authenticated using (
  (situacao <> 'em_apuracao' and not app.instrumento_restrito(instrumento_id))
  or app.pode_ver_restrito(instrumento_id)
);
create policy ocorrencia_registrar on public.ocorrencia_parceiro for insert to authenticated
with check (
  registrado_por = auth.uid() and orgao_id = app.meu_orgao()
  and app.e_designado(instrumento_id, array['gestor','fiscal']::public.papel_instrumento[])
);
create policy ocorrencia_decidir on public.ocorrencia_parceiro for update to authenticated
  using (app.e_designado(instrumento_id, array['gestor','fiscal']::public.papel_instrumento[]))
  with check (app.e_designado(instrumento_id, array['gestor','fiscal']::public.papel_instrumento[]));

-- Histórico: o órgão que cadastrou o registro (decisão de 12/11/2026), além de
-- Controle e administração da plataforma. Dentro do órgão, continuam valendo o
-- acesso restrito e o sigilo das penalidades em apuração.
create policy historico_ler on public.historico for select to authenticated using (
  app.e_controle()
  or app.e_adm_plataforma()
  or (
    orgao_id = app.meu_orgao()
    and (
      instrumento_id is null
      or not app.instrumento_restrito(instrumento_id)
      or app.pode_ver_restrito(instrumento_id)
    )
    and (
      tabela <> 'ocorrencia_parceiro'
      or app.pode_ver_restrito(instrumento_id)
      or (coalesce(antes ->> 'situacao', '') <> 'em_apuracao'
          and coalesce(depois ->> 'situacao', '') <> 'em_apuracao')
    )
  )
);
