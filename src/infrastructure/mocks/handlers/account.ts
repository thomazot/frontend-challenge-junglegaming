import type { Profile, Wallet } from "@/shared/api/contracts";
import { avatarRules, changePasswordSchema, updateProfileSchema, walletSchema, walletUpdateSchema } from "@/shared/api/schemas";
import { currentScenario, hashPassword, mutateDb, nextId, randomToken, type UserRecord } from "../db";
import { publicUser } from "../domain";
import { ApiFailure, ok, parse, route } from "../server";

const toProfile = (user: UserRecord): Profile => ({
  ...publicUser(user),
  ...(user.phone ? { phone: user.phone } : {}),
  ...(user.document ? { document: user.document } : {}),
});

const hasMagicBytes = (bytes: Uint8Array, signature: readonly number[]) => signature.every((value, index) => bytes[index] === value);

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};

export const accountHandlers = [
  route("get", "/api/profile", (ctx) => ok(toProfile(ctx.user)), { auth: true }),

  route("patch", "/api/profile", async (ctx) => {
    const input = parse(updateProfileSchema, await ctx.json());
    const profile = mutateDb((db) => {
      const user = db.users.find((candidate) => candidate.id === ctx.user.id)!;
      Object.assign(user, input);
      return toProfile(user);
    });
    return ok(profile);
  }, { auth: true }),

  route("post", "/api/profile/avatar", async (ctx) => {
    const form = await ctx.request.clone().formData().catch(() => undefined);
    const file = form?.get("avatar");
    if (!(file instanceof File)) throw new ApiFailure(422, "VALIDATION_ERROR", "Envie uma imagem", { avatar: "Selecione uma imagem" });
    if (file.size > avatarRules.maxBytes) throw new ApiFailure(422, "VALIDATION_ERROR", "Imagem muito grande", { avatar: "A imagem deve ter até 1 MB" });

    const signature = avatarRules.allowed[file.type as keyof typeof avatarRules.allowed];
    const bytes = new Uint8Array(await file.arrayBuffer());
    // Validate declared type AND real content (magic bytes) against an allow-list.
    if (!signature || !hasMagicBytes(bytes, signature)) {
      throw new ApiFailure(422, "VALIDATION_ERROR", "Formato inválido", { avatar: "Use PNG, JPEG ou WebP" });
    }
    const avatarUrl = `data:${file.type};base64,${toBase64(bytes)}`;
    const profile = mutateDb((db) => {
      const user = db.users.find((candidate) => candidate.id === ctx.user.id)!;
      user.avatarUrl = avatarUrl;
      return toProfile(user);
    });
    return ok(profile);
  }, { auth: true }),

  route("post", "/api/profile/password", async (ctx) => {
    const input = parse(changePasswordSchema, await ctx.json());
    const current = await hashPassword(input.currentPassword, ctx.user.passwordSalt);
    if (current !== ctx.user.passwordHash) {
      throw new ApiFailure(422, "VALIDATION_ERROR", "Senha atual incorreta", { currentPassword: "Senha atual incorreta" });
    }
    const salt = randomToken(16);
    const hash = await hashPassword(input.newPassword, salt);
    mutateDb((db) => {
      const user = db.users.find((candidate) => candidate.id === ctx.user.id)!;
      user.passwordSalt = salt;
      user.passwordHash = hash;
      // Other devices must sign in again after a password change.
      for (const [sid, session] of Object.entries(db.sessions)) {
        if (session.userId === user.id && sid !== ctx.cookies.sid) delete db.sessions[sid];
      }
    });
    return ok({ ok: true });
  }, { auth: true }),

  route("get", "/api/wallets", (ctx) => ok({ data: ctx.db.wallets[ctx.user.id] ?? [] }), { auth: true }),

  route("post", "/api/wallets", async (ctx) => {
    const input = parse(walletSchema, await ctx.json());
    const wallet = mutateDb((db) => {
      const list = (db.wallets[ctx.user.id] ??= []);
      if (list.some((candidate) => candidate.kind === input.kind)) {
        throw new ApiFailure(409, "CONFLICT", "Você já possui uma carteira deste tipo", { kind: "Já existe uma carteira deste tipo" });
      }
      const created: Wallet = { id: nextId("wallet", "w"), ...input };
      list.push(created);
      return created;
    });
    return ok(wallet, { status: 201 });
  }, { auth: true }),

  route("patch", "/api/wallets/:id", async (ctx) => {
    const input = parse(walletUpdateSchema, await ctx.json());
    const wallet = mutateDb((db) => {
      const list = (db.wallets[ctx.user.id] ??= []);
      const target = list.find((candidate) => candidate.id === ctx.params.id);
      if (!target) throw new ApiFailure(404, "NOT_FOUND", "Carteira não encontrada");
      const next = parse(walletSchema, { ...target, ...input });
      if (list.some((candidate) => candidate.id !== target.id && candidate.kind === next.kind)) {
        throw new ApiFailure(409, "CONFLICT", "Você já possui uma carteira deste tipo", { kind: "Já existe uma carteira deste tipo" });
      }
      Object.assign(target, next);
      return { ...target };
    });
    return ok(wallet);
  }, { auth: true }),

  route("post", "/api/wallets/:id/connect", (ctx) => {
    const wallet = (ctx.db.wallets[ctx.user.id] ?? []).find((candidate) => candidate.id === ctx.params.id);
    if (!wallet) throw new ApiFailure(404, "NOT_FOUND", "Carteira não encontrada");
    if (currentScenario().behavior.walletRefuses) throw new ApiFailure(422, "WALLET_REJECTED", "A carteira recusou a conexão");
    return ok({ connected: true, address: wallet.address, network: wallet.network });
  }, { auth: true }),

  route("post", "/api/wallets/:id/disconnect", (ctx) => {
    if (!(ctx.db.wallets[ctx.user.id] ?? []).some((candidate) => candidate.id === ctx.params.id)) {
      throw new ApiFailure(404, "NOT_FOUND", "Carteira não encontrada");
    }
    return ok({ connected: false });
  }, { auth: true }),
];
