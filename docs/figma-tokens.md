# Design Tokens — Jungle Gaming NFT Marketplace

Estes são os tokens de design (cores, tipografia e espaçamento) que estão norteando o projeto. Eles estão mapeados para o formato que o **Tailwind v4** e o **Shadcn/UI** consomem.

## Tipografia (Typography)
- **Fonte Principal (Sans):** `Roboto Mono` e fallback para `monospace`.
- **Fonte de Cabeçalhos (Heading):** `Roboto Mono`.
*(Também está disponível a fonte Geist via `@fontsource-variable/geist` como fallback secundário).*

## Paleta de Cores (Colors)

| Variável | Valor Hex | Uso principal |
| :--- | :--- | :--- |
| `--color-background` | `#140d0a` | Fundo principal da aplicação (Preto/Marrom escuro) |
| `--color-foreground` | `#f5f1eb` | Texto principal (Off-white / Bege claro) |
| `--color-card` | `#241612` | Fundo de Cards e elementos contidos |
| `--color-card-foreground` | `#f5f1eb` | Texto dentro de Cards |
| `--color-popover` | `#241612` | Fundo de tooltips, dropdowns e menus flutuantes |
| `--color-popover-foreground` | `#f5f1eb` | Texto dentro de popovers |
| `--color-primary` | `#e89b55` | Cor de destaque primária (Laranja/Dourado) |
| `--color-primary-foreground` | `#140d0a` | Texto que vai por cima da cor primária |
| `--color-secondary` | `#38220f` | Cor de destaque secundária (Marrom mais claro que o fundo) |
| `--color-secondary-foreground` | `#f5f1eb` | Texto que vai por cima da cor secundária |
| `--color-muted` | `#2f1d15` | Fundos de elementos inativos ou menos importantes |
| `--color-muted-foreground` | `#cfb28c` | Texto esmaecido / secundário (Bege mais escuro) |
| `--color-accent` | `#38220f` | Fundos para interações como hover |
| `--color-accent-foreground` | `#f5f1eb` | Texto em áreas de acento/hover |
| `--color-destructive` | `#f0805f` | Botões e avisos de erro/deleção (Coral) |
| `--color-destructive-foreground` | `#f5f1eb` | Texto dentro de elementos destrutivos |
| `--color-border` | `#38220f` | Cor das bordas (inputs, cards, dividers) |
| `--color-input` | `#38220f` | Fundo de inputs |
| `--color-ring` | `#e89b55` | Cor do anel de foco (outline focus) na navegação por teclado |

## Espaçamentos e Bordas (Radius)
| Variável | Valor (rem) | Uso |
| :--- | :--- | :--- |
| `--radius-sm` | `0.3rem` | Arredondamento pequeno (ex: checkboxes, tags) |
| `--radius-md` | `0.5rem` | Arredondamento médio (ex: botões, inputs) |
| `--radius-lg` | `0.75rem` | Arredondamento grande (ex: cards menores) |
| `--radius-xl` | `1rem` | Arredondamento extra grande (ex: modais, cards grandes) |
| `--radius-2xl` | `1.5rem` | Arredondamento 2XL |
| `--radius-3xl` | `2rem` | Arredondamento 3XL |
| `--radius-4xl` | `3rem` | Elementos extremamente arredondados / pílulas |

---
**Nota:** Estes tokens estão injetados globalmente no `src/index.css` utilizando a funcionalidade `@theme inline` do Tailwind CSS v4.
