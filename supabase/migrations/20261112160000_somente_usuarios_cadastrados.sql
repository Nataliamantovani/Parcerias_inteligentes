-- =============================================================================
-- SIGACT IA — Só servidores cadastrados e ativos acessam os dados
--
-- Correção de segurança: estar autenticado no Supabase não basta. A pessoa
-- precisa ter um registro ATIVO na tabela public.usuario (feito pelo
-- administrador). Isso protege contra contas criadas por conta própria e
-- permite bloquear um servidor desligado só marcando ativo = false.
--
-- Usa políticas RESTRITIVAS: elas se somam (E lógico) às regras existentes.
-- =============================================================================

create function app.e_usuario_ativo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.usuario where id = auth.uid() and ativo)
$$;

grant execute on function app.e_usuario_ativo() to authenticated;

create policy somente_cadastrados on public.orgao as restrictive for all to authenticated
  using (app.e_usuario_ativo()) with check (app.e_usuario_ativo());
create policy somente_cadastrados on public.usuario as restrictive for all to authenticated
  using (app.e_usuario_ativo()) with check (app.e_usuario_ativo());
create policy somente_cadastrados on public.parceiro as restrictive for all to authenticated
  using (app.e_usuario_ativo()) with check (app.e_usuario_ativo());
create policy somente_cadastrados on public.instrumento as restrictive for all to authenticated
  using (app.e_usuario_ativo()) with check (app.e_usuario_ativo());
create policy somente_cadastrados on public.designacao as restrictive for all to authenticated
  using (app.e_usuario_ativo()) with check (app.e_usuario_ativo());
create policy somente_cadastrados on public.verificacao_regularidade as restrictive for all to authenticated
  using (app.e_usuario_ativo()) with check (app.e_usuario_ativo());
create policy somente_cadastrados on public.ocorrencia_parceiro as restrictive for all to authenticated
  using (app.e_usuario_ativo()) with check (app.e_usuario_ativo());
create policy somente_cadastrados on public.historico as restrictive for all to authenticated
  using (app.e_usuario_ativo()) with check (app.e_usuario_ativo());
