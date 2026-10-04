# Arquitetura do Sistema — Jungle Gaming NFT Marketplace

Este documento descreve as decisões arquiteturais, contratos, estado e estratégias, servindo como a **única fonte de verdade** para o desenvolvimento manual e orientação de agentes de IA. A arquitetura é rigorosamente **feature-oriented**, projetada para baixo acoplamento e alta velocidade de desenvolvimento, sem abstrações prematuras ou overengineering.

---

## PARTE I - Políticas e Contratos de Domínio

### 1. Estratégia de Estado e Cache (TanStack Query)
- **Gerenciamento:** O **TanStack Query** é a fonte única de verdade para estado remoto. Requisições (Axios) são cacheadas com chaves compostas (ex: `['nfts', { page, filters }]`).
- **Persistência:** Carrinho e Favoritos residem no cache e são espelhados no Local Storage para resistirem a reloads.
- **Optimistic Updates:** Aplicados em mutações de interface rápidas (favoritos, carrinho). Ocorrendo falha, há rollback automático.
- **Cancelamento:** Requisições obsoletas (mudanças de filtros rápidas) são abortadas para evitar *race conditions*.

### 2. Roteamento e Estado da URL (TanStack Router)
- **Segurança:** Utiliza-se TanStack Router para segurança de tipagem (Type-Safe). A configuração de rotas fica sob `app/router/`.
- **Estado de UI na URL:** Filtros, ordenação e paginação do catálogo são mantidos estritamente nos `searchParams` da URL, garantindo compartilhamento de links e restauração de estado.

### 3. Mocking e Camada de Rede (MSW)
- Toda comunicação é interceptada via MSW, cujas rotinas e handlers vivem em `infrastructure/mocks/`. Nenhum dado simulado "vaza" para UI.
- O MSW fornece simulação de conexões falhas, timeouts e respostas 4xx/5xx para validação de fluxos complexos.

### 4. Tempo Real (Socket.IO) e Reconciliação
- **Eventos:** 
  - `nft.updated`: Invalida queries e trava o checkout se a cotação mudar.
  - `order.updated`: Atualiza dinamicamente status de pedido.
- **Resiliência e Idempotência:** Eventos atrasados ou duplicados são descartados via conferência de `version`. Quedas de conexão engatilham recarregamento via REST. Mutações possuem chaves de idempotência para bloquear duplo gasto.

### 5. Política de Sessão
- Autenticação e credenciais virtuais possuem expiração.
- A sessão é consultada pela API ao iniciar a aplicação e recuperada pelo cookie; somente o objeto de sessão fica no cache em memória do TanStack Query. Credenciais e tokens não são persistidos em Local Storage.
- Login e cadastro atualizam o cache da sessão após sucesso e sincronizam o carrinho do visitante. As mutations não retêm as variáveis de credenciais após concluírem.
- Logout e troca de usuário removem as queries privadas e desconectam o socket da sessão anterior; o catálogo permanece em cache e dados dependentes do usuário são invalidados quando necessário.
- Se a sessão for perdida no checkout, o usuário vai para o login com contexto preservado.

---

## PARTE II - Organização do Código e Pastas

A aplicação é dividida verticalmente nestas camadas: `app` → `features` → `shared`. Detalhes técnicos residem na `infrastructure`.

### Visão Geral (Árvore Principal)
```text
src/
├── app/             # Composição e orquestração (providers, router config, routes)
├── features/        # Domínios e regras de negócio isoladas
├── shared/          # UI puramente visual e utilitários globais cegos de negócio
└── infrastructure/  # Comunicação e mocks (HTTP, Sockets, MSW)
```

### 1. `shared/ui` (Primitivos Shadcn)
- Destinada **exclusivamente** aos componentes do shadcn/ui (`button.tsx`, `input.tsx`, etc).
- **Extremamente Proibido:** Importar `features/*`, hooks de domínio, chamadas Axios/API ou TanStack Query para dentro destes arquivos. 

### 2. `shared/components` (Componentes Genéricos Próprios)
- Componentes reaproveitáveis de UI criados por nós (ex: `Header`, `Footer`, `EmptyState`) que não contêm lógica de negócio.
- Nunca faça de `shared` uma lixeira. Não crie `<GenericCard />` ou `<PrimaryButton />` para abstrair classes Tailwind sem motivo real de composição.

### 3. `features/*` (O Coração do Negócio)
Cada feature agrupa tudo o que é pertinente àquele domínio:
`auth`, `catalog`, `nft`, `favorites`, `cart`, `checkout`, `orders`, `profile`, `wallets`.
- **Componentes Específicos:** Se o componente tem comportamento amarrado (ex: `<AddToCartButton />`), ele DEVE ficar na feature, como `features/cart/components/AddToCartButton/`.
- Nenhuma pasta vazia (como `hooks/` ou `schemas/`) será criada prematuramente dentro da feature. Elas só existirão se houver arquivos a popular.

### 4. Estrutura Padrão de Componentes
Qualquer componente próprio criado (seja em `shared/components` ou `features/*/components`) deve seguir rigorosamente a indexação por pasta com nome igual ao componente:

```text
ComponentName/
├── ComponentName.tsx        # Lógica e marcação
├── ComponentName.test.tsx   # Teste focado em comportamento
└── index.ts                 # API Pública (ex: `export { ComponentName } from "./ComponentName";`)
```
- Apenas separar em um arquivo `.variants.ts` (ex: `Button.variants.ts`) quando o componente usar `class-variance-authority` (CVA) e possuir uma grande cadeia de estilos e states que poluem absurdamente o arquivo principal. A regra é focar em velocidade de leitura.

### 5. Configuração e Estilos (Tailwind CSS v4)
- Usamos **Tailwind diretamente nos componentes**. Proibido criar wrappers visuais para esconder Tailwind sob desculpas de abstração.
- O mapeamento global de tema (Tokens do Figma) já é realizado via CSS Variáveis centralizadas e injetadas pelo Tailwind.

### 6. Testes
- Sempre localizados imediatamente junto à feature ou componente que testam (`.test.tsx`), seguindo o padrão da aplicação. O nome dos casos de teste sempre será declarativo: `it("should ...")`.

---

## PARTE III - Regras Mandatórias para Agentes de IA

1. Não criar arquivos fora do escopo da tarefa sem justificativa.
2. Não mover ou diluir as camadas verticais de `app -> features -> shared -> infra`.
3. Não criar abstrações genéricas e wrappers de tailwind antecipadamente.
4. Não criar arquivos e pastas vazias (ex: `utils/` que não vai ser usado).
5. Preferir composição explícita das primitives do shadcn disponíveis em `shared/ui`.
6. Os `index.ts` são sagrados para manter a importação limpa sem deep-path (evitar importar `/Header/Header`), e não devem fazer re-exports insanos se a API principal já resolve.
7. Validar estritamente o peso e a razão de um componente estar em `shared/components`. Se ele tiver mínimo cheiro de domínio (como "só aparece no catálogo"), jogue-o para `features/catalog/components`.
