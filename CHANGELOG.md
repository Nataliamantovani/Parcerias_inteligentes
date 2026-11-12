# Changelog

Todas as mudanças relevantes do projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Segurança

- Atualizado o TanStack Start para 1.168.61, que corrige o XSS refletido nas server functions (GHSA-qx66-fv34-fjm8), e o `seroval` para 1.8.1, que corrige a desserialização insegura (GHSA-mv8w-475r-vwqw, GHSA-p6vx-979v-rg4c). Achado #1 da auditoria de 23/10/2026.
- Atualizadas as demais dependências dentro das versões compatíveis e o `zod` para a versão 4. O `bun audit` caiu de 76 alertas (4 críticos) para 2 de gravidade baixa ou moderada, apenas em ferramentas de desenvolvimento.

### Adicionado

- Fundação do banco de dados (PostgreSQL/Supabase): tabelas de órgãos, usuários, parceiros, instrumentos, designações, verificações, ocorrências e histórico, com as regras do Modelo de Perfis e Permissões v0.2 aplicadas no próprio banco (Row Level Security) e 26 testes de permissão. Ver `docs/banco-de-dados.md`.
- Módulo **Habilitação e Regularidade dos Parceiros** (etapa 1), em `/habilitacao`: catálogo configurável de requisitos por modalidade, painel de regularidade com sete situações, registro manual identificado como tal e situação de ativação de cada fonte. Integração oficial com a API da CGU (CEIS, CNEP, CEPIM), executada só no servidor e protegida por trava de ativação. As demais fontes ficam estruturadas, aguardando adesão ao Conecta gov.br ou como verificação assistida. Ver `docs/habilitacao.md`.
- Testes automáticos com Vitest (29 testes), incluídos no CI.
- Verificação automática (CI) no GitHub Actions. A cada proposta de mudança, ela instala as dependências, checa os tipos, roda o lint, compila o site e audita a segurança das dependências de produção.

### Alterado

- Código formatado com o Prettier. O lint, que falhava com 292 erros de formatação, agora passa.
- O `bun.lock` passa a baixar os pacotes do registro público do npm, e não do cache privado da Lovable. Assim o projeto pode ser instalado fora da Lovable.
- O TanStack Start fica travado na linha 1.168.x, porque a 1.169 exige o Vite 8, que o pacote de configuração da Lovable ainda não suporta.

### Corrigido

- Tipagem da tela de erro (`src/routes/__root.tsx`), que impedia a checagem de tipos (`tsc`) de passar.

## [0.1.0] — 2026-10-22 · alfa

Primeira versão pública: protótipo navegável da plataforma.

### Adicionado

- Página inicial, página "Por que esta plataforma existe?" e roadmap de implementação em seis fases.
- Painel Executivo com indicadores, alertas e instrumentos prioritários.
- Telas de Governança, Instrumentos, Parceiros, Motor de Risco, Auditoria Inteligente, Monitoramento, Inteligência Institucional e Valor Público.
- Interface do assistente virtual Ideobaldo.
- Navegação por menu superior e menu lateral.

### Limitações conhecidas

- Os dados exibidos são ilustrativos (`src/lib/mock-data.ts`).
- Ainda não há banco de dados nem login.
- O Ideobaldo responde com uma mensagem de demonstração; o modelo de IA ainda não está conectado.

[0.1.0]: https://github.com/Nataliamantovani/Parcerias_inteligentes/releases/tag/v0.1.0
