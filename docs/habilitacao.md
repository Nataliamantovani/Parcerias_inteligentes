# Módulo Habilitação e Regularidade dos Parceiros

Etapa 1 de 4 (estrutura, conector CGU e verificação assistida). Tela: `/habilitacao`, no menu **Instrumentos → Habilitação e Regularidade**.

## O que o módulo faz hoje

1. Recebe o **CNPJ**, a **modalidade da parceria** e, opcionalmente, a **natureza jurídica** do parceiro.
2. Monta a lista de **requisitos aplicáveis** a partir de um catálogo configurável (`src/modules/habilitacao/dominio/requisitos.ts`).
3. Consulta, **no servidor**, as fontes que têm integração oficial. Hoje é só a CGU (CEIS, CNEP, CEPIM).
4. Mostra o **painel de regularidade** com sete situações possíveis: regular, irregular, vencido, indisponível, não realizada, não aplicável e requer análise humana.
5. Permite **registrar manualmente** o resultado das fontes sem API. O registro fica marcado como "inserido manualmente".
6. Mostra, para cada fonte, **o que falta para ativar** a consulta automática.

### Regras de segurança implementadas (com testes)

- Consulta indisponível ou não realizada **nunca** vira "regular" nem "irregular".
- Registro manual nunca conta como verificação em fonte oficial.
- A síntese **nunca** afirma "habilitado". A conclusão é do servidor.
- Uma restrição identificada não dispara nenhuma ação automática sobre o acordo.
- A chave da API é lida só no servidor e o código dos conectores não vai para o navegador (verificado no build).
- **Trava de ativação:** sem `HABILITACAO_CONSULTAS_ATIVAS=true`, nenhuma base externa é consultada.

## Situação das fontes

| Fonte                      | Situação                             | O que falta                                                   |
| -------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| CGU — CEIS, CNEP, CEPIM    | **Integração oficial implementada**  | Chave gratuita (login gov.br) e liberação de rede do servidor |
| Receita — CNPJ             | Requer adesão ao Conecta gov.br      | Adesão do órgão, credenciais e documentação técnica da API    |
| RFB/PGFN — certidão fiscal | Requer adesão ao Conecta gov.br      | Idem (API "CND" do catálogo Conecta)                          |
| PGFN — CADIN               | Requer adesão ao Conecta gov.br      | Idem, mais autorização da PGFN                                |
| TST — CNDT                 | Verificação assistida                | Não há API oficial de acesso aberto identificada              |
| Caixa — CRF/FGTS           | Verificação assistida                | Não há API oficial de acesso aberto identificada              |
| TCU — consulta consolidada | Verificação assistida                | Não há API oficial documentada; CEIS/CNEP já vêm da CGU       |
| SICAF                      | Verificação assistida (em avaliação) | Verificar a API de Dados Abertos do Compras.gov.br            |
| Banco Central              | Verificação assistida (em avaliação) | Verificar as APIs de dados abertos do BCB                     |

Nenhuma fonte é consultada por raspagem de site, e nenhum CAPTCHA é contornado.

## Como testar a consulta real à CGU (no seu computador)

1. Obtenha a chave em https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email.
2. Copie `.env.example` para `.env` e preencha:
   ```
   HABILITACAO_CONSULTAS_ATIVAS=true
   PORTAL_TRANSPARENCIA_API_KEY=sua-chave
   ```
3. Rode `bun install` e `bun run dev`, e abra http://localhost:8080/habilitacao (ou a porta indicada no terminal).
4. Consulte um CNPJ real. CEIS, CNEP e CEPIM devem aparecer com data, hora e link de evidência.

**Nunca** ative a trava no site público enquanto não houver login.

## Como acrescentar uma nova base governamental

1. Crie `src/modules/habilitacao/conectores/<nome>.ts` implementando a interface `Conector` (`conectores/tipos.ts`).
2. Registre-o em `conectores/registro.ts`.
3. Associe os requisitos do catálogo que ele verifica.
4. Escreva testes com respostas simuladas, como em `__tests__/conectores.test.ts`.

## Catálogo de requisitos

As três modalidades (ACT com instituição financeira, parceria com OSC e ACT com outras pessoas jurídicas) são uma **configuração inicial de exemplo**. A lista de requisitos de cada modalidade e o campo `baseLegal` precisam ser validados pela área jurídica do órgão. Hoje `baseLegal` vem como "a definir", de propósito.

## Ainda não implementado (próximas etapas)

- **Banco de dados e login** (pré-requisito): histórico permanente, trilha de auditoria, segregação por órgão e perfis, conforme o documento de perfis e permissões.
- **Etapa 3, dossiê em PDF:** depende do histórico persistido.
- **Etapa 4, monitoramento:** periodicidade, vencimentos, alertas, comparação entre consultas. Depende do banco e de um agendador no ambiente institucional.
- **Conectores Conecta:** dependem da adesão do órgão.
- **Integração com os demais módulos:** vínculo com o instrumento, painel gerencial e Ideobaldo.

Por enquanto, os registros manuais ficam só na tela e se perdem ao recarregar a página. A trilha mínima de cada consulta automática vai para o log do servidor.
