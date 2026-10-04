# CHECKLIST de implementação — Marketplace de NFTs

Snapshot documental da implementação no branch de entrega. Os status abaixo são baseados nas rotas, componentes, handlers MSW e testes E2E presentes no repositório; não equivalem a uma avaliação oficial nem substituem testes manuais.

- **Implementado:** há código funcional para o escopo indicado.
- **Parcial:** há suporte em parte da interface, infraestrutura ou cobertura de testes, mas o fluxo solicitado não está completo.
- **Pendente:** não foi localizada a interface ou evidência necessária no código consultado.

## Stack e infraestrutura

| Requisito | Status | Evidência/limitação |
| --- | --- | --- |
| React e TypeScript | Implementado | Aplicação e build tipados. |
| TanStack Router | Implementado | Rotas de catálogo (`/`) e detalhe (`/nft/$nftSlug`). |
| TanStack Query e Axios | Implementado | Consultas/mutations usam cache e transporte HTTP centralizado. |
| Tailwind CSS e componentes shadcn/ui | Implementado | Base visual do projeto. |
| MSW para API e Socket.IO | Implementado | Handlers REST e binding Socket.IO com cenários selecionáveis. |
| Socket.IO no cliente | Implementado | Subscription autenticada e consumo de `nft.updated`/`order.updated`. |
| Playwright e Lighthouse | Parcial | Testes E2E e workflow Lighthouse existem; cobertura e auditoria ainda não satisfazem todos os cenários/protocolos do enunciado. |

## Interface e fluxos

| Requisito | Status | Evidência/limitação |
| --- | --- | --- |
| Catálogo, destaque, busca, filtros e paginação | Parcial | Página inicial e busca/filtros existem; a suíte E2E atual não cobre filtros combinados, ordenação, paginação e histórico por completo. |
| Detalhe, galeria e NFTs relacionados | Implementado | Rota direta de detalhe, estados de erro, galeria, dados e itens relacionados. |
| Favoritos | Implementado | Integração com API simulada e atualização otimista com rollback. |
| Adicionar NFT ao carrinho | Parcial | A ação e os handlers existem; o header exibe a contagem, mas não há tela completa de carrinho ligada ao botão. |
| Tela de carrinho com edição, remoção, cupom e resumo | Pendente | Handlers REST de carrinho/cotação existem, mas não foi localizada rota/interface de carrinho completa. |
| Checkout, pagamento e confirmação de pedido | Pendente | Handlers simulam criação, cotação e estados do pedido, mas não foi localizada uma jornada de checkout/recibo na interface. |
| Login e cadastro | Parcial | Diálogo com validação e API simulada; telas dedicadas, expiração e retomada de fluxo não estão cobertas integralmente pela E2E atual. |
| Perfil e gestão de carteiras | Pendente | Handlers simulados existem; não foi localizada interface completa de perfil/carteiras. |
| Responsividade desktop/mobile | Parcial | Home e detalhe possuem layouts responsivos e baselines; não há páginas completas de carrinho/checkout a validar em todos os viewports. |

## Regras, tempo real e mocks

| Requisito | Status | Evidência/limitação |
| --- | --- | --- |
| Estado do catálogo sincronizado pela URL | Parcial | Busca e tab são exercitadas por E2E; cobertura de todos os filtros, ordenação, paginação e navegação pelo histórico ainda é necessária. |
| Persistência e isolamento das contas | Parcial | Sessão mock, cache privado e dados por usuário existem; falta cobertura E2E abrangente de troca de usuário e exposição entre contas. |
| Cotação, carrinho e idempotência de pedidos | Parcial | Handlers validam cotação, disponibilidade e chave idempotente; ainda falta interface de checkout para demonstrar o fluxo de ponta a ponta. |
| Eventos de NFT via Socket.IO | Implementado | A E2E verifica que um evento recebido pelo cliente atualiza o detalhe e o cache. |
| Eventos de pedido, duplicatas, reconexão e retomada | Parcial | Lógica de eventos/reconciliação e handlers existem; testes E2E para os cenários completos ainda são necessários. |
| Cenários MSW determinísticos e reset | Implementado | Painel dev, parâmetro de URL e endpoints de controle permitem selecionar/resetar cenários. |

## Testes, auditoria e documentação

| Requisito | Status | Evidência/limitação |
| --- | --- | --- |
| Playwright executável desktop/mobile | Parcial | Existem testes para URL do catálogo, detalhe, favorito, autenticação mobile, contrato, Socket.IO e baselines Home/detalhe; vários fluxos obrigatórios do enunciado ainda não têm teste. |
| Regressão visual de Home, detalhe, carrinho e pagamento | Parcial | Baselines atuais cobrem Home e detalhe; não existem telas/baselines completas para carrinho e pagamento. |
| Lighthouse com alvos do desafio | Parcial | CI audita Home/detalhe em desktop/mobile, mas faz uma execução por combinação, sem medianas de três medições nem coleta automática de LCP/CLS/TBT. |
| Setup, cenários, contratos e arquitetura documentados | Parcial | README, [ARCHITECTURE.md](../ARCHITECTURE.md), [CHALLEGER.md](./CHALLEGER.md) e [QUALITY.md](./QUALITY.md) documentam o projeto; limitações e cobertura parcial estão indicadas. |
| Deploy público | Implementado | URL pública consta no README; é necessário verificar disponibilidade e correspondência com o commit no momento da avaliação. |

## Prioridades para fechar as lacunas

1. Implementar interfaces e jornadas de carrinho, checkout, confirmação, perfil e carteiras consumindo os handlers existentes.
2. Completar Playwright para compra, falhas, sessão, conta, realtime e teclado; adicionar baselines de carrinho e pagamento.
3. Completar as medições Lighthouse: três execuções por rota/perfil, medianas, LCP, CLS e TBT.
4. Reavaliar visualmente os frames mobile/tablet/desktop do Figma e registrar desvios observados.
