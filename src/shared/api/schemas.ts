import { z } from "zod";
import { isEthString } from "@/shared/lib/eth";

/** Single source of truth for input validation: mock handlers and forms share these schemas. */
const messages = {
  name: "Informe um nome (2 a 80 caracteres)",
  email: "E-mail inválido",
  password: "A senha deve ter de 8 a 128 caracteres",
};

export const networkSchema = z.enum(["Ethereum", "Polygon", "Solana"]);
export const ethSchema = z.string().refine(isEthString, "Valor em ETH inválido");

export const emailSchema = z.string().trim().toLowerCase().max(254, messages.email).pipe(z.email(messages.email));
export const nameSchema = z.string().trim().min(2, messages.name).max(80, messages.name);
export const passwordSchema = z.string().min(8, messages.password).max(128, messages.password);

export const registerSchema = z.object({ name: nameSchema, email: emailSchema, password: passwordSchema });
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string().min(1, "Confirme sua senha").max(128) })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Informe a senha").max(128) });

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s().-]{7,18}$/, "Telefone inválido")
    .optional(),
  document: z
    .string()
    .trim()
    .regex(/^[\d.\-/]{5,20}$/, "Documento inválido")
    .optional(),
});

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, "Informe a senha atual").max(128), newPassword: passwordSchema })
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: "A nova senha deve ser diferente da atual",
  });

const ADDRESS_BY_NETWORK: Record<z.infer<typeof networkSchema>, RegExp> = {
  Ethereum: /^0x[0-9a-fA-F]{40}$/,
  Polygon: /^0x[0-9a-fA-F]{40}$/,
  Solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
};

export const walletSchema = z
  .object({
    label: z.string().trim().min(2, "Informe um nome para a carteira").max(40),
    address: z.string().trim(),
    network: networkSchema,
    kind: z.enum(["primary", "secondary"]),
  })
  .superRefine((value, ctx) => {
    if (!ADDRESS_BY_NETWORK[value.network].test(value.address)) {
      ctx.addIssue({ code: "custom", path: ["address"], message: "Endereço inválido para a rede selecionada" });
    }
  });

export const walletUpdateSchema = z.object({
  label: z.string().trim().min(2, "Informe um nome para a carteira").max(40).optional(),
  address: z.string().trim().optional(),
  network: networkSchema.optional(),
  kind: z.enum(["primary", "secondary"]).optional(),
});

const csv = (value: unknown) =>
  typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : value;

export const nftListParamsSchema = z.object({
  q: z.string().trim().max(80).optional(),
  collection: z.preprocess(csv, z.array(z.string().max(40)).max(20)).optional(),
  network: z.preprocess(csv, z.array(networkSchema).max(3)).optional(),
  minPrice: ethSchema.optional(),
  maxPrice: ethSchema.optional(),
  sort: z.enum(["recent", "price-asc", "price-desc"]).optional(),
  tab: z.enum(["todos", "novos", "alta"]).optional(),
  page: z.coerce.number().int().min(1).max(10_000).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

export const cartItemSchema = z.object({
  nftId: z.string().min(1).max(32),
  quantity: z.number().int().min(1, "Quantidade mínima é 1").max(99),
});
export const cartQuantitySchema = z.object({ quantity: z.number().int().min(1).max(99) });
export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3, "Informe o cupom").max(24).regex(/^[A-Z0-9_-]+$/, "Cupom inválido"),
});

export const orderInputSchema = z.object({
  quoteId: z.string().min(1).max(64),
  walletId: z.string().min(1).max(32),
  network: networkSchema,
  collector: z.object({ fullName: nameSchema, email: emailSchema }),
});

export const avatarRules = {
  maxBytes: 1_048_576,
  allowed: { "image/png": [0x89, 0x50, 0x4e, 0x47], "image/jpeg": [0xff, 0xd8, 0xff], "image/webp": [0x52, 0x49, 0x46, 0x46] },
} as const;

/** Maps zod issues to `{ field: message }` (first issue per field wins). */
export const toFieldErrors = (error: z.ZodError): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
};
