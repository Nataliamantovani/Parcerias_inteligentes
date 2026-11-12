# Banco de dados do SIGACT IA

O banco é **PostgreSQL**, com as regras de permissão **dentro do próprio banco** (Row Level Security). Na fase de protótipo ele roda no Supabase, região São Paulo, **somente com dados fictícios**. Por ser Postgres padrão, pode migrar depois para a infraestrutura do órgão.

- Migrações, aplicadas em ordem:
  1. `supabase/migrations/20261112150000_fundacao.sql`
  2. `supabase/migrations/20261112160000_somente_usuarios_cadastrados.sql`
- Testes das permissões: `supabase/tests/permissoes.test.ts`. São 26 testes, que rodam num Postgres local a cada proposta de mudança.

## O que existe

| Tabela                     | Para quê                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `orgao`                    | Órgãos que usam a plataforma                                                       |
| `usuario`                  | Servidores: órgão e perfil (consulta, controle, adm. do órgão, adm. da plataforma) |
| `parceiro`                 | Banco único de parceiros, visível a todos os órgãos                                |
| `instrumento`              | Acordos e instrumentos, com situação, vigência e marca de acesso restrito          |
| `designacao`               | Quem é formalização, gestor ou fiscal de cada instrumento, e desde quando          |
| `verificacao_regularidade` | Resultados do módulo Habilitação, oficiais ou manuais; só inclusão                 |
| `ocorrencia_parceiro`      | Méritos e penalidades; penalidade em apuração é restrita                           |
| `historico`                | Trilha de auditoria automática de todas as tabelas acima                           |

## Regras garantidas (cada uma tem teste)

- Usuário **não autenticado** não lê nada.
- Estar logado **não basta**: sem cadastro **ativo** em `usuario`, o banco não devolve nenhum dado. Para bloquear um servidor desligado, basta marcar `ativo = false`.
- **Banco único:** todos os órgãos leem parceiros e instrumentos não restritos.
- Quem cadastra um instrumento fica **designado para a formalização** automaticamente, e só pode cadastrar no **próprio órgão**.
- **Formalização** edita até a celebração e marca como celebrado, o que exige a data de celebração. Depois disso, não altera mais.
- **Gestor** muda a situação e a vigência e marca ou desmarca o **acesso restrito**. Não altera os dados da formalização.
- **Fiscal** não altera o instrumento. Ele registra verificações e ocorrências.
- **Acesso restrito:** só os designados e o perfil **Controle** veem.
- **Penalidade em apuração:** só os designados e o Controle veem. Depois da decisão definitiva, todos os órgãos veem. A descrição não pode ser editada.
- **Administrador do órgão** designa papéis e cria usuários só no próprio órgão. Ele não cria perfis de Controle nem de administrador da plataforma.
- **Nada se apaga**, nem pelo administrador da plataforma. Verificações não são alteradas: uma correção é um novo registro.
- **Histórico** automático de toda alteração, com autor e valores antes e depois. Ninguém o altera. Quem lê é o órgão que cadastrou o registro, respeitando o acesso restrito.

## Decisões confirmadas em 12/11/2026

1. **Quem cadastra instrumento:** qualquer servidor do órgão. Quem cadastrou vira automaticamente a formalização daquele instrumento.
2. **Quem lê o histórico:** o **órgão que cadastrou** o registro, além de Controle e administrador da plataforma. Dentro do órgão, o histórico de instrumento restrito e de penalidade em apuração continua visível só para os designados.
3. **Correção do cadastro do parceiro:** só o administrador da plataforma, até os dados virem da Receita.

## Como aplicar no Supabase (passo a passo)

1. No painel do projeto no Supabase, abra **SQL Editor** e clique em **New query**.
2. Abra o arquivo `supabase/migrations/20261112150000_fundacao.sql` no GitHub e clique em **Raw**. Copie todo o conteúdo e cole no editor.
3. Clique em **Run**. Deve aparecer "Success. No rows returned".
4. Em **Authentication → Users → Add user**, crie o seu usuário (e-mail e senha).
5. Copie o **User UID** do usuário criado e rode no SQL Editor, trocando os valores entre `< >`:

```sql
insert into public.orgao (sigla, nome) values ('ORG-TESTE', 'Órgão Fictício de Teste');
insert into public.usuario (id, orgao_id, nome, perfil)
select '<USER UID>', id, '<Seu nome>', 'adm_plataforma' from public.orgao where sigla = 'ORG-TESTE';
```

Pronto: você é a administradora da plataforma no protótipo.

**Nunca** copie para o chat, para o código ou para o GitHub a senha do banco nem a chave `service_role`.

## Login no aplicativo

- Tela **/entrar**, com e-mail e senha pelo Supabase Auth, e tela **/conta**, que mostra órgão e perfil.
- No menu superior aparece **Entrar** ou o nome da pessoa conectada.
- O endereço e a chave **publishable** do projeto ficam em `src/lib/supabase/cliente.ts`. São públicos por natureza. Para outro projeto, use `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Desative o cadastro aberto no Supabase:** Authentication → Sign In / Providers → desligue **"Allow new users to sign up"**. Os usuários são criados só pela administração.

## Próximo passo

Ligar o módulo Habilitação ao banco: gravação do módulo Habilitação no banco, o histórico de consultas e o dossiê em PDF.
