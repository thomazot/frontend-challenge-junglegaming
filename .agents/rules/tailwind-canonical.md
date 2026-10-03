---
description: Regra obrigatória para validação contínua de classes TailwindCSS canônicas (suggestCanonicalClasses)
globs: "**/*.{tsx,ts,jsx,js}"
---

# Regra: Tailwind Canonical Classes (suggestCanonicalClasses)

Toda vez que qualquer código com classes Tailwind for escrito ou modificado, você DEVE aplicar IMEDIATAMENTE as classes canônicas antes de responder.
- Nunca use valores arbitrários `[...px]` quando existir um token nativo ou da escala (ex: `gap-5.5` em vez de `gap-[22px]`, `w-72` em vez de `w-[300px]`, `max-w-7xl` em vez de `max-w-[1200px]`, `rounded` em vez de `rounded-[4px]`, `rounded-lg` em vez de `rounded-[8px]`, `text-sm` em vez de `text-[14px]`, `text-lg` em vez de `text-[18px]`).
- Essa verificação é OBRIGATÓRIA e AUTOMÁTICA em toda edição, sem necessidade do usuário pedir.
