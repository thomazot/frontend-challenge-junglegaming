# DESIGN TOKENS — Jungle Gaming NFT Marketplace

Os tokens abaixo refletem a fonte de verdade atual em [`src/tokens.json`](../src/tokens.json). O arquivo [`src/styles/tokens.css`](../src/styles/tokens.css) é gerado com `pnpm generate:tokens`; não edite o CSS gerado manualmente.

## Tipografia

| Uso | Família |
| --- | --- |
| Sans e títulos | Roboto Mono, monospace |
| Fonte adicional empacotada | Geist Variable, importada de `@fontsource-variable/geist` |

Roboto Mono é importada do Google Fonts em [`src/index.css`](../src/index.css), portanto sua disponibilidade depende de acesso à rede. Geist é empacotada localmente como dependência, mas não é a fonte principal configurada no tema.

## Cores

### Cores principais

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-primary` | `#D28A4C` | Destaques e ações principais |
| `--color-primary-light` | `#DD9A5F` | Variação clara da cor primária |
| `--color-primary-dark` | `#C47B3E` | Variação escura da cor primária |
| `--color-amber` | `#E3A44E` | Destaque âmbar |
| `--color-foreground` | `#F5F1EB` | Texto principal |
| `--color-text-primary` | `#F7F3EC` | Texto de alto contraste |
| `--color-text-secondary` | `#CFB28C` | Texto secundário |
| `--color-text-accent` | `#E89B55` | Texto de destaque |
| `--color-text-muted` | `#B0916A` | Texto discreto |
| `--color-ink` | `#140D0A` | Fundo principal |
| `--color-ink-deep` | `#0E0907` | Fundo mais escuro |
| `--color-ink-soft` | `#1C110C` | Fundo escuro intermediário |
| `--color-surface-card` | `#241612` | Superfície de cards |
| `--color-surface-raised` | `#2F1D15` | Superfície elevada |
| `--color-surface-dark` | `#38220F` | Superfície escura e hover |
| `--color-border` | `#3F2319` | Borda |
| `--color-border-soft` | `#55321F` | Borda suave; mapeada também para `--color-border` do tema |
| `--color-success` | `#00A66C` | Feedback de sucesso |
| `--color-error` | `#ED1B2E` | Feedback de erro |
| `--color-text-coral` | `#F0805F` | Destaque coral |
| `--color-white` | `#FFFFFF` | Branco |
| `--color-black` | `#000000` | Preto |

### Cores auxiliares

O arquivo de tokens também define `--color-secondary: #B39463`, `--color-background-elevated: #FBFBFB` e `--color-gray-light: #EDEDED`, além de cores de marca para logotipos. Consulte [`src/tokens.json`](../src/tokens.json) para a lista completa.

Em [`src/index.css`](../src/index.css), os aliases do tema Tailwind/shadcn são mapeados para esses tokens: `background` usa `ink`, `card`/`popover` usam `surface-card`, `muted`/`accent` usam `surface-dark`, `destructive` usa `error` e `ring` usa `primary`.

## Raios de borda

| Token | Valor |
| --- | ---: |
| `--radius-sm` | `0.3rem` |
| `--radius-md` | `0.5rem` |
| `--radius-lg` | `0.75rem` |
| `--radius-xl` | `1rem` |
| `--radius-2xl` | `1.5rem` |
| `--radius-3xl` | `2rem` |
| `--radius-4xl` | `3rem` |

Os raios e aliases do tema ficam em `src/index.css`; a paleta fonte de verdade vem de `src/tokens.json` e é regenerada com `pnpm generate:tokens`.
