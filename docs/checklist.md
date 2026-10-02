# Checklist do Desafio Frontend — Marketplace de NFTs

Aqui estão os itens obrigatórios extraídos do README.md do projeto, separados por categorias.

## 1. Stack Obrigatória
- [ ] Interface em **React** e linguagem **TypeScript**
- [ ] Roteamento com **TanStack Router** (parâmetros de URL, histórico preservado)
- [ ] Estado remoto com **TanStack Query** (invalidação, cache, mutations)
- [ ] Cliente HTTP **Axios** para APIs REST
- [ ] Tempo real com **Socket.IO** (`socket.io-client`)
- [ ] Estilização visual com **Tailwind CSS** e **shadcn/ui**
- [ ] Mocking na camada de rede com **MSW** (REST e Socket.IO via `@mswjs/socket.io-binding`)
- [ ] Testes E2E e regressão visual com **Playwright**
- [ ] Auditoria com **Lighthouse**

## 2. Telas e Fluxos (Desktop e Mobile)
- [ ] **Início**: Destaques, catálogo, busca, filtros (combináveis), ordenação e paginação.
- [ ] **Detalhes do NFT**: Galeria, infos, favoritos e ações de compra, com skeletons e acesso direto suportado.
- [ ] **Carrinho**: Adicionar, editar quantidade, remover, aplicar cupom, subtotal e taxas.
- [ ] **Pagamento**: Dados do colecionador, seleção de carteira e rede (simuladas), revisão final.
- [ ] **Confirmação**: Resultado, ID de transação, itens, taxas.
- [ ] **Conta**: Cadastro, Login, Logout, Perfil do Colecionador (edição e avatar) e Cadastro/edição de Carteiras.

## 3. Comportamento e Regras de Negócio
### Catálogo e Detalhe
- [ ] URL State: busca, filtros e paginação guardados na URL e resistindo a refresh.
- [ ] Favoritos persistentes para o usuário logado.
### Carrinho e Compra
- [ ] Persistência do carrinho após refresh; transferência do carrinho de visitante ao logar.
- [ ] Cupons com validação (código inválido/expirado).
- [ ] Valores em ETH mantidos como strings decimais sem perda de precisão.
- [ ] Impedir cliques repetidos e pedidos duplicados (idempotência com chave na mutation).
- [ ] Revalidação de preço e disponibilidade antes da compra; exigir confirmação nova se mudar.
### Conta e Sessão
- [ ] Sessão recuperável e expiração tratada (preservando contexto).
- [ ] Validações de formulários e tratamento de erros vindos da API simulada.
- [ ] Logout limpa o estado privado em cache.

## 4. Integração e Tempo Real (Socket.IO)
- [ ] Eventos implementados: `nft.updated` e `order.updated`.
- [ ] Reagir aos eventos: Atualizar catálogo, carrinho e detalhes do NFT ao vivo.
- [ ] Tratar interrupção de pagamento: Impedir confirmação de carrinho se cotação ficar desatualizada devido a um evento.
- [ ] Tolerância a eventos duplicados/antigos sem regressão de estado e tratamento de reconexão.

## 5. Mocking (MSW) e Casos Extremos
- [ ] MSW utilizado exclusivamente para as respostas (nenhum mock hardcoded em componentes/hooks).
- [ ] Mocks devem manter persistência de estado e possuir suporte a reset.
- [ ] Casos de falha simulados: respostas de erro 4xx/5xx, timeouts, conexões lentas, etc.

## 6. Interface e Acessibilidade (A11y)
- [ ] Fidelidade visual e responsividade ao Figma (Mobile, Tablet, Desktop - 390px, 768px, 1440px).
- [ ] Uso de **skeletons (shimmer effect)** durante loading para não pular layout.
- [ ] Navegação por teclado funcional e foco visível e controlado em diálogos/drawers.
- [ ] Semântica, contraste e não depender apenas de cor para feedbacks.

## 7. Testes e Performance
- [ ] Testes E2E (Playwright) para fluxos felizes e falhas (incluindo falha de pagamento, expiração, etc).
- [ ] Regressão visual nas páginas principais (Início, Detalhes, Carrinho e Pagamento).
- [ ] Lighthouse no build otimizado (Meta: Performance ≥90, A11y ≥95, Best Practices ≥95, SEO ≥90).

## 8. Avaliação e Entrega
- [ ] Deploy funcional na Vercel/Netlify/Cloudflare Pages contendo os mocks ativados.
- [ ] Documentação (README) com setup, variáveis, reset de mock.
- [ ] Arquivo `ARCHITECTURE.md` para documentar contratos, cache, estado e desvios do Figma.
