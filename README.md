# Jungle Gaming — NFT Marketplace

Marketplace responsivo de NFTs construído para o desafio técnico Frontend Developer da Jungle Gaming.

## Entrega

- **Aplicação publicada:** https://junglegaming.thomazot.com.br/
- **Repositório:** https://github.com/thomazot/frontend-challenge-junglegaming
- **Branch entregue:** https://github.com/thomazot/frontend-challenge-junglegaming/tree/thomazot/challenge
- **Design de referência:** [Figma](https://www.figma.com/design/8ehqY4RLqcztDLYkASXBCr/Frontend-Challenge--Copy-?node-id=10-244&m=dev)
- **Enunciado e critérios completos:** [docs/CHALLEGER.md](./docs/CHALLEGER.md)

O projeto implementa descoberta e busca de NFTs, filtros, detalhes, favoritos, carrinho, checkout simulado, pedidos, conta do colecionador e atualizações em tempo real. Serviços externos de pagamento, carteiras e blockchain são simulados; a aplicação não depende de backend privado.

## Stack

- React 19 e TypeScript
- TanStack Router e TanStack Query
- Axios e contratos validados com Zod
- Tailwind CSS e componentes shadcn/ui
- MSW para APIs REST simuladas e integração de eventos Socket.IO
- Playwright para testes E2E e regressão visual
- Vite para desenvolvimento e build
- Lighthouse para auditoria de qualidade

## Requisitos

- Node.js 22
- pnpm 11 (o workflow de CI usa pnpm 11.28.3)

## Instalação e execução

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

O comando `pnpm dev` gera os tokens de design e inicia o Vite. Abra no navegador o endereço apresentado no terminal. O `.env.example` habilita os mocks para desenvolvimento.

Para verificar o build de produção localmente:

```bash
VITE_ENABLE_MOCKS=true pnpm build
pnpm preview --host 127.0.0.1
```

O preview fica disponível, por padrão, em `http://127.0.0.1:4173`.

### Variáveis de ambiente

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | `true` | Habilita MSW. Mantenha `true` para desenvolvimento, testes E2E e build de demonstração. |
| `VITE_MOCK_SCENARIO` | `default` | Define o cenário inicial dos mocks; pode ser substituído pelo parâmetro de URL `?scenario=<id>`. |

As variáveis com prefixo `VITE_` ficam disponíveis no bundle do navegador. Não coloque nelas segredos ou credenciais reais.

## Contas fictícias

| Conta | E-mail | Senha |
| --- | --- | --- |
| Ana Colecionadora | `ana@jungle.test` | `Jungle#2024-ana` |
| Bruno Minter | `bruno@jungle.test` | `Jungle#2024-bruno` |

As contas existem apenas no banco de dados simulado do navegador. As senhas são armazenadas como hashes PBKDF2 com salt individual.

## Cenários de mock

Em modo de desenvolvimento, use o painel **⚙️ Mocks** no canto inferior da interface para selecionar um cenário e restaurar os dados. Também é possível selecionar um cenário pela URL; a seleção é persistida no navegador.

| Cenário | Comportamento exercitado |
| --- | --- |
| `default` | Fluxo normal com latência variável. |
| `fast` | Fluxo normal sem latência artificial; usado nos testes E2E. |
| `slow` | Rede lenta, para verificar skeletons e carregamento. |
| `empty` | Catálogo sem resultados. |
| `out-of-order` | Respostas de busca chegam fora de ordem. |
| `offline` | Falha de conexão. |
| `server-error` | Erro HTTP 500 no catálogo. |
| `transient` | Falha transitória seguida de sucesso em nova tentativa. |
| `session-expired` | Sessões expiram rapidamente. |
| `favorite-fails` | Erro ao favoritar, para verificar rollback otimista. |
| `price-changed` | Cotação/preço muda durante o checkout. |
| `sold-out` | Item fica indisponível durante o checkout. |
| `order-timeout` | Resposta da criação do pedido sofre timeout, permitindo testar recuperação idempotente. |
| `payment-declined` | Pagamento é recusado. |
| `wallet-refuses` | Conexão da carteira é recusada. |

Exemplo: `http://localhost:5173/?scenario=slow`.

Use **Resetar DB** no painel para restaurar o cenário selecionado. Pelo console do navegador, também é possível redefinir explicitamente:

```js
await window.__mocks.reset("default");
location.reload();
```

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Gera tokens e inicia o servidor de desenvolvimento. |
| `pnpm build` | Gera tokens, executa TypeScript (`tsc`) e cria o build de produção. |
| `pnpm preview --host 127.0.0.1` | Serve localmente o build de produção. |
| `pnpm test` | Executa a suíte Playwright. |
| `pnpm test:e2e` | Alias para executar a suíte Playwright. |
| `pnpm test:e2e:update` | Atualiza os baselines de regressão visual; revise as imagens antes de aceitá-las. |
| `pnpm generate:tokens` | Gera os tokens de design. |

Não há script de lint separado configurado. O build inclui a verificação de tipos TypeScript.

## Testes Playwright

Instale Chromium e rode a suíte:

```bash
pnpm exec playwright install chromium
pnpm test
```

O Playwright inicia seu próprio servidor em modo `e2e`, executa os projetos desktop e mobile e usa o cenário rápido para manter os dados previsíveis. Os testes cobrem catálogo, busca e URL, detalhe direto e inexistente, rollback de favorito, ação de conta no footer mobile, validação de contratos, Socket.IO e baselines visuais.

O relatório HTML é salvo em `playwright-report/`. Para abri-lo:

```bash
pnpm exec playwright show-report
```

Traces, vídeos e capturas de tela são retidos em caso de falha. Os baselines visuais versionados ficam em `e2e/__screenshots__/`.

## Arquitetura e decisões

- **Rotas e estado remoto:** TanStack Router mantém as rotas e parâmetros de busca; TanStack Query gerencia consultas, mutations, cache e invalidação; Axios centraliza as chamadas REST.
- **Contratos:** os tipos de transporte ficam em `src/shared/api/contracts.ts`; schemas Zod validam dados externos antes do uso na interface.
- **APIs simuladas:** MSW intercepta chamadas na camada de rede. O banco simulado mantém estado coerente de contas, catálogo, favoritos, carrinho, perfil, carteiras e pedidos, com persistência local para suportar refresh.
- **Conta e isolamento:** as sessões são simuladas por cookies. Ao sair ou trocar de usuário, dados privados são removidos do cache e a conexão realtime da sessão anterior é encerrada.
- **Carrinho e checkout:** o carrinho e a cotação são consultados pela API simulada. A cotação é revalidada antes da criação do pedido. A chave de idempotência permite recuperar a mesma compra após timeout; a confirmação usa o snapshot imutável do pedido.
- **Atualização otimista:** favoritos atualizam a interface antes da resposta do servidor e fazem rollback em caso de falha.
- **Socket.IO:** cliente same-origin em `/socket.io/`, usando WebSocket, sem fallback de long-polling. Em builds com mocks, o binding do MSW simula o protocolo. `nft.updated` atualiza dados de NFTs e invalida cotação/carrinho; `order.updated` sincroniza pedidos. Eventos antigos ou duplicados são descartados pela identidade e versão, e uma reconexão invalida consultas ativas para reconciliar o estado com REST.
- **Limitação do realtime:** a demonstração depende dos mocks habilitados; o transporte WebSocket sem polling é uma decisão para compatibilidade com a interceptação Socket.IO do MSW.

## Lighthouse

A configuração automatizada está em [`.github/workflows/lighthouse.yml`](./.github/workflows/lighthouse.yml). O workflow constrói a aplicação com mocks e audita início e detalhe em desktop e mobile; publica pontuações no resumo da execução e armazena os relatórios JSON como artifact por 14 dias.

Para a auditoria local:

```bash
VITE_ENABLE_MOCKS=true pnpm build
pnpm preview --host 127.0.0.1
```

Em outro terminal, execute Lighthouse. O perfil padrão é mobile; use `--preset=desktop` para desktop. Troque a rota para `/nft/emerald-ape-000` para auditar a página de detalhe:

```bash
pnpm dlx lighthouse@13.5.0 http://127.0.0.1:4173/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output-path=/tmp/lighthouse-mobile-home.html \
  --chrome-flags="--headless --no-sandbox"
```

O workflow atual executa uma medição por rota e perfil; para cumprir integralmente o protocolo do desafio, repita cada combinação três vezes e reporte a mediana. Registre também LCP, CLS e TBT, versão do Lighthouse, ambiente e condições de execução. Mais detalhes: [docs/QUALITY.md](./docs/QUALITY.md).

## Escopo original do desafio

O documento [docs/CHALLEGER.md](./docs/CHALLEGER.md) preserva o enunciado, a stack obrigatória, os fluxos, critérios de qualidade, requisitos de entrega e a rubrica de avaliação.
