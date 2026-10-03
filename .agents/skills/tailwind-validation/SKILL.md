---
name: tailwind-validation
description: Validação contínua de classes TailwindCSS para garantir o uso de classes canônicas (suggestCanonicalClasses).
---

# Tailwind CSS Validation Skill

**Contexto:**
Sempre que o agente criar, refatorar ou modificar componentes React utilizando Tailwind CSS, ele deve obrigatoriamente garantir que as classes utilizadas sejam as **canônicas**, evitando ao máximo interpolações arbitrárias desnecessárias e ordenando as classes de forma previsível.

## Regras de Validação (suggestCanonicalClasses):

1. **Evitar Valores Arbitrários para Padrões Existentes:**
   - Em vez de `w-[40px]`, utilize `w-10`.
   - Em vez de `text-[14px]`, utilize `text-sm`.
   - Em vez de `leading-[24px]`, utilize `leading-6` (ou equivalentes no `tailwind.config.ts`).
   - Use valores arbitrários (`[x]`) APENAS se o valor não puder ser arredondado ou aproximado para um token de design canônico já existente no tema.

2. **Ordenação Canônica (Prettier/Tailwind plugin):**
   - Estruture as classes na ordem oficial recomendada pelo Tailwind: Layout (position, display) -> Box Model (width, height, padding, margin) -> Typography -> Visuals (background, border, color, shadow) -> Transitions/Interactivity.

3. **Validação Ativa:**
   - Ao finalizar a implementação visual de um componente, o agente deve automaticamente rodar uma revisão rápida nas strings de `className="..."`.
   - Se identificar propriedades como `p-[10px]`, o agente deve converter silenciosa e imediatamente para `p-2.5`.

4. **Coesão com Shadcn:**
   - Quando integrar componentes Shadcn (que utilizam `cn()` e clsx/tailwind-merge), certifique-se de que não existam conflitos de classes e que as classes sugeridas continuem seguindo o padrão canônico do tema `new-york` ou equivalente do projeto.

**Ativação:**
Esta skill opera automaticamente durante a geração de código. O agente NÃO DEVE gerar código sem antes se auto-avaliar atuando como um Linter vivo de TailwindCSS.
