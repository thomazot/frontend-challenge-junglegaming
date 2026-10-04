# Arquitetura e decisões técnicas

Este documento registra como as responsabilidades da aplicação estão organizadas, como os dados fluem entre UI, REST e Socket.IO e quais limitações pertencem à simulação do desafio. A interface entregue cobre principalmente catálogo, detalhe de NFT, favoritos, autenticação em diálogo e ação de adicionar ao carrinho; parte dos handlers REST tem recursos sem telas ou jornada completa conectadas. O escopo e os critérios originais estão em [docs/CHALLEGER.md](./docs/CHALLEGER.md); o estado de cobertura está em [docs/CHECKLIST.md](./docs/CHECKLIST.md); setup e comandos estão no [README.md](./README.md).

## Visão geral

```text
React UI
  ├── TanStack Router: catálogo e detalhe, parâmetros e estado de busca na URL
  ├── TanStack Query: consultas, mutations, cache e invalidação
  ├── Axios: transporte HTTP e normalização de erros
  └── Socket.IO client: eventos realtime associados à sessão
          │
          ├── REST ──> MSW handlers ──> domínio mock ──> banco local
          └── WS   ──> MSW Socket.IO binding ──> eventos do domínio mock
```

O frontend depende dos contratos REST e de eventos, não de respostas colocadas nos componentes. MSW intercepta o transporte no browser e compartilha fixtures e estado entre desenvolvimento, testes e build de demonstração. Não é necessário um backend privado para executar os fluxos do projeto.

## Organização de responsabilidades

| Área | Responsabilidade |
| --- | --- |
| `src/app` | Composição da aplicação, rotas, providers e sincronização global. |
| `src/features` | Componentes de catálogo, NFTs, autenticação, newsletter e ação de adicionar ao carrinho. |
| `src/infrastructure/http` | Cliente Axios e funções de acesso aos recursos REST. |
| `src/infrastructure/mocks` | Fixtures, cenários, banco simulado, handlers MSW e transporte realtime de teste. |
| `src/infrastructure/socket` | Cliente Socket.IO, ciclo de vida da conexão e subscriptions. |
| `src/shared/api/contracts.ts` | Tipos de request, response e eventos consumidos pela aplicação. |
| `src/shared/api/schemas.ts` | Schemas Zod para validar dados recebidos antes do uso na interface. |
| `src/shared/lib` e `src/shared/components` | Utilitários, componentes e elementos de interface compartilhados. |
| `e2e` | Testes Playwright, helpers e baselines visuais. |

As rotas UI atualmente registradas são `/` e `/nft/$nftSlug`. Não há rotas de tela completas para carrinho, checkout/recibo, perfil ou gestão de carteiras, embora os handlers simulados de alguns desses recursos existam.

TanStack Router mantém os parâmetros do catálogo na URL para permitir refresh, compartilhamento e navegação pelo histórico. TanStack Query mantém o estado remoto e controla carregamento, erros, mutations e invalidação. As chamadas HTTP são feitas pelos módulos de infraestrutura via Axios; componentes não fabricam respostas de API.

## Contratos REST

Os handlers MSW implementam os seguintes recursos de aplicação:

| Recurso | Rotas principais | Acesso/observações |
| --- | --- | --- |
| Sessão e conta | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout` | Sessão simulada por cookie; senha derivada com PBKDF2 e salt por usuário. |
| Catálogo e NFTs | `GET /api/nfts`, `GET /api/nfts/:id`, `GET /api/nfts/:id/reviews` | Busca, filtros, ordenação e paginação são fornecidos como parâmetros de consulta. |
| Favoritos | `GET /api/favorites`, `GET /api/nfts/:id/favorite`, `PUT /api/favorites/:id`, `DELETE /api/favorites/:id` | Dados associados ao usuário autenticado. |
| Carrinho e cotação | `GET /api/cart`, `GET /api/cart/quote`, `POST /api/cart/items`, `PATCH /api/cart/items/:nftId`, `DELETE /api/cart/items/:nftId`, `PUT/DELETE /api/cart/coupon` | O carrinho de visitante é preservado e mesclado na autenticação. |
| Pedidos | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id` | Criação autenticada, com cotação validada e chave `Idempotency-Key`. |
| Perfil e carteiras | `GET/PATCH /api/profile`, `POST /api/profile/avatar`, `POST /api/profile/password`, `GET/POST /api/wallets`, `PATCH /api/wallets/:id`, `POST /api/wallets/:id/connect`, `POST /api/wallets/:id/disconnect` | Handlers simulados autenticados; interface completa não está implementada. |
| Newsletter | `POST /api/newsletter/subscriptions` | Inscrição simulada. |

As rotas de controle `/api/__mocks__/*` existem para demonstração e testes; não são parte da API de produto. Os handlers validam entradas e retornam erros estruturados, como validação, sessão inválida, conflito, cupom inválido, indisponibilidade e falha transitória. A camada HTTP valida as respostas com Zod e propaga erros explícitos para os estados de recuperação da interface.

Valores monetários trafegam como strings decimais ETH nos contratos, evitando arredondamento binário. O resumo e a cotação são calculados e retornados pela API simulada; a UI não confirma compras apenas com base em estado local.

## Sessão e isolamento de dados

- Login e cadastro estabelecem cookies de sessão simulados; `GET /api/auth/session` recupera a sessão após refresh.
- O estado privado consultado é associado ao usuário atual. Queries são invalidadas/limpas no logout ou troca de identidade, e a conexão realtime anterior é encerrada.
- O carrinho anônimo usa uma identidade de visitante. Após autenticação, seus itens são mesclados ao carrinho da conta.
- Erros de expiração durante a navegação são apresentados ao usuário e abrem o fluxo de autenticação para permitir recuperação.
- Os usuários e as senhas seed são apenas dados fictícios de demonstração; não são credenciais de produção.

## Carrinho, cotação e pedidos

Os handlers mantêm carrinho e cotação persistentes para itens selecionados. A interface de detalhe permite adicionar ao carrinho, mas ainda não há tela completa de carrinho ligada ao botão do header. Alterações disponíveis na API são enviadas por mutations REST; o cache Query é atualizado ou invalidado a partir do resultado do servidor. A cotação informa preços, taxas, descontos, disponibilidade e problemas que impedem a compra.

O handler de pedidos simula estes passos, ainda sem uma jornada completa de checkout conectada na interface:

1. A aplicação busca uma cotação atual e permite revisão antes do envio.
2. A criação do pedido envia a cotação e a chave de idempotência.
3. O handler verifica novamente preço e disponibilidade. Alterações incompatíveis impedem a confirmação e requerem nova cotação.
4. Repetir uma mesma chave com o mesmo conteúdo recupera o pedido original; reutilizá-la com conteúdo diferente gera conflito.
5. O pedido guarda um snapshot dos itens, valores, carteira e dados do colecionador. O recibo usa esse snapshot, sem depender de valores posteriores do catálogo.
6. Apenas o resultado terminal confirmado exibe sucesso; falhas preservam o carrinho e pedidos recusados não se tornam confirmações.

Os cenários `price-changed`, `sold-out`, `order-timeout`, `payment-declined` e `wallet-refuses` permitem exercitar essas condições. `order-timeout` simula a perda da resposta depois de persistir o pedido para validar a recuperação idempotente.

## Cache e mutações

TanStack Query é usado para estado remoto. As chaves distinguem recursos e parâmetros do catálogo; as mutations invalidam as consultas relacionadas após alterações. Respostas de catálogo/detalhe são validadas antes da renderização e erros de contrato tornam-se falhas recuperáveis, em vez de acessos a propriedades inexistentes.

Favoritos implementam atualização otimista: o estado visível muda antes da resposta, mas o snapshot anterior é restaurado se a mutation falhar. O cenário `favorite-fails` cobre esse rollback.

Eventos realtime atualizam diretamente os dados em cache que já estão ativos e invalidam recursos dependentes para buscar a fonte REST. A identidade e a versão monotônica do recurso protegem o cache de eventos duplicados ou fora de ordem.

## Socket.IO e reconciliação

O cliente Socket.IO é lazy e singleton, conecta ao mesmo host em `/socket.io/` autenticado por sessão e usa `transports: ["websocket"]`. As subscriptions são removidas no cleanup do ciclo de vida; logout ou mudança de usuário desconecta a instância.

| Evento | Dados relevantes | Reação do cliente |
| --- | --- | --- |
| `nft.updated` | ID estável do evento, NFT, versão, horário, preço e disponibilidade | Atualiza catálogo/detalhe em cache; invalida catálogo, detalhe, carrinho e cotação para reconciliar valores dependentes. |
| `order.updated` | ID estável do evento, pedido, versão, horário e status terminal, com dados de transação/recusa | Atualiza o pedido/lista em cache e apresenta feedback de confirmação ou recusa. |

O cliente descarta IDs de evento já vistos e versões não superiores à última processada para o recurso. Se a conexão for interrompida e depois restabelecida, consultas de catálogo, detalhe, carrinho e pedidos são invalidadas, recuperando o estado pela API REST. A chave de idempotência evita criar outro pedido ao recuperar uma tentativa pendente após reconexão ou refresh.

### Limitações do realtime simulado

Em builds com `VITE_ENABLE_MOCKS=true`, o binding `@mswjs/socket.io-binding` simula o protocolo Socket.IO por WebSocket e os eventos são emitidos a partir das mutations no domínio mock. Polling HTTP não é habilitado: o cliente usa WebSocket para compatibilidade com o binding. Esse servidor simulado não substitui um serviço Socket.IO de produção nem oferece disponibilidade fora do contexto do browser que executa os mocks.

## Mocking e cenários determinísticos

MSW intercepta tanto REST quanto a conexão Socket.IO em builds de demonstração. O estado simulado é persistido localmente para permitir refresh; o reset volta a um cenário seed conhecido. Cenários configuram latência, falhas e respostas de domínio sem lógica alternativa dentro dos componentes.

Os cenários incluem fluxo normal e rápido, rede lenta, catálogo vazio, respostas fora de ordem, offline, erro 500, erro transitório, sessão expirada, falha de favorito, preço alterado, edição esgotada, timeout após criação do pedido, pagamento recusado e recusa de carteira. Os controles de cenário e reset são ferramentas de desenvolvimento/teste e não devem ser tratados como endpoints de produção.

## UX, responsividade e acessibilidade

As telas de catálogo e detalhe usam layouts responsivos e assets locais para imagens. Roboto Mono é carregada por Google Fonts; Geist é empacotada como dependência adicional. O catálogo, detalhe e áreas dependentes de API apresentam estados de carregamento, vazio e falha, com tentativa de recuperação quando aplicável. O diálogo de autenticação e outros drawers usam componentes acessíveis compartilhados; botões e campos possuem nomes acessíveis e os elementos de navegação preservam semântica.

O README orienta execução e testes nos perfis desktop e mobile. Os baselines Playwright cobrem Home e detalhe em desktop/mobile. Uma comparação manual ou automatizada final com todos os frames originais do Figma ainda é responsabilidade da revisão visual da entrega; indisponibilidade do Figma pode impedir inspeção independente do arquivo.

## Testes e qualidade

Playwright inicia o Vite no modo `e2e`, reseta o banco simulado para o cenário `fast` antes de cada teste e executa projetos desktop e mobile. As verificações exercitam resultados visíveis e operações, incluindo URL do catálogo, acesso direto ao detalhe, falha com rollback otimista e atualização Socket.IO. Baselines de screenshot ficam versionadas em `e2e/__screenshots__/`; relatório HTML, traces, vídeos e screenshots de falha são artefatos gerados.

O workflow de Lighthouse está em [`.github/workflows/lighthouse.yml`](./.github/workflows/lighthouse.yml), e as instruções de auditoria ficam em [docs/QUALITY.md](./docs/QUALITY.md). O workflow atual executa uma medição por página e perfil e reporta pontuações; ele ainda não calcula as três medições e medianas nem registra LCP, CLS e TBT automaticamente. Para atender integralmente ao protocolo descrito no desafio, essas medições e métricas devem ser registradas na execução de auditoria.

## Decisões, desvios e limitações conhecidos

- APIs, sessão, pagamento, carteiras e eventos são simulações MSW; não há conexão blockchain ou gateway de pagamento real.
- O realtime de demonstração depende de MSW habilitado e usa WebSocket sem fallback de polling.
- O workflow Lighthouse publica relatórios de uma execução, sem impor limiares nem produzir medianas de três execuções.
- Os resultados de performance variam por dispositivo/runner. Reporte condições de execução e métricas junto às notas; não interprete uma única medição como resultado estável.
- Substituições de assets, composição e eventuais diferenças em relação ao Figma devem ser registradas durante a revisão visual da entrega, especialmente se novos arquivos do design se tornarem acessíveis.
