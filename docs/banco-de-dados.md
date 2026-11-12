# Banco de dados do SIGACT IA

O banco é **PostgreSQL**, com as regras de permissão **dentro do próprio banco** (Row Level Security). Na fase de protótipo ele roda no Supabase, região São Paulo, **somente com dados fictícios**. Por ser Postgres padrão, pode migrar depois para a infraestrutura do órgão.

- Migração: `supabase/migrations/20261112150000_fundacao.sql`
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
- **Banco único:** todos os órgãos leem parceiros e instrumentos não restritos.
- Quem cadastra um instrumento fica **designado para a formalização** automaticamente, e só pode cadastrar no **próprio órgão**.
- **Formalização** edita até a celebração e marca como celebrado, o que exige a data de celebração. Depois disso, não altera mais.
- **Gestor** muda a situação e a vigência e marca ou desmarca o **acesso restrito**. Não altera os dados da formalização.
- **Fiscal** não altera o instrumento. Ele registra verificações e ocorrências.
- **Acesso restrito:** só os designados e o perfil **Controle** veem.
- **Penalidade em apuração:** só os designados e o Controle veem. Depois da decisão definitiva, todos os órgãos veem. A descrição não pode ser editada.
- **Administrador do órgão** designa papéis e cria usuários só no próprio órgão. Ele não cria perfis de Controle nem de administrador da plataforma.
- **Nada se apaga**, nem pelo administrador da plataforma. Verificações não são alteradas: uma correção é um novo registro.
- **Histórico** automático de toda alteração, com autor e valores antes e depois. Ninguém o altera.

## Interpretações que precisam da sua confirmação

1. **Quem cadastra instrumento:** qualquer servidor do órgão pode cadastrar e vira formalização daquele instrumento. A alternativa seria só o administrador do órgão cadastrar e designar.
2. **Quem lê o histórico completo:** hoje, só Controle e administrador da plataforma.
3. **Correção do cadastro do parceiro:** hoje, só o administrador da plataforma. No futuro, os dados virão da Receita, via Conecta.

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

## Próximo passo

Login no aplicativo com o Supabase Auth: e-mail no protótipo, gov.br na fase institucional. Depois, a gravação do módulo Habilitação no banco, o histórico de consultas e o dossiê em PDF.
