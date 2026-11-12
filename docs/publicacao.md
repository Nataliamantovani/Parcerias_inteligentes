# Publicação do SIGACT IA

O site é publicado na **Cloudflare (Workers)**, ligado a este repositório do GitHub. Toda proposta aprovada na branch `main` é compilada e publicada automaticamente em poucos minutos.

| Item           | Valor                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Worker         | `parcerias-inteligentes`                                                |
| Build command  | `bun run build`                                                         |
| Deploy command | `npx wrangler deploy`                                                   |
| Configuração   | `wrangler.jsonc`, mesclado pelo build em `.output/server/wrangler.json` |

O nome em `wrangler.jsonc` precisa ser igual ao do Worker no painel da Cloudflare.

## Variáveis de ambiente

Nenhuma é necessária para o site funcionar. Elas só são usadas pelo módulo de Habilitação:

- `HABILITACAO_CONSULTAS_ATIVAS`: **não defina** enquanto o site for público sem controle de acesso por login nas consultas.
- `PORTAL_TRANSPARENCIA_API_KEY`: chave da CGU. Se for usada, cadastre como **Secret** no painel da Cloudflare, nunca no código.

## Site anterior (Lovable)

O projeto "Inteligência em Parcerias" na Lovable continua publicado com a versão de outubro de 2026. Ele não recebe as mudanças deste repositório.

Última verificação da publicação automática: 12/11/2026.
