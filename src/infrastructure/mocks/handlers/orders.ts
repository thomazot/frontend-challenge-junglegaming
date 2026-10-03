import { HttpResponse } from "msw";
import type { Order } from "@/shared/api/contracts";
import { orderInputSchema } from "@/shared/api/schemas";
import { currentScenario, mutateDb, nextId, runtime } from "../db";
import { bumpPrice, computeQuote, getCartRecord, ORDER_SETTLE_MS, settleIfDue, settleOrder, toOrder, updateNft } from "../domain";
import { ApiFailure, ok, parse, route } from "../server";

const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,80}$/;

export const orderHandlers = [
  route("post", "/api/orders", async (ctx) => {
    const key = ctx.request.headers.get("idempotency-key");
    if (!key || !IDEMPOTENCY_KEY.test(key)) {
      throw new ApiFailure(400, "IDEMPOTENCY_KEY_REQUIRED", "Cabeçalho Idempotency-Key obrigatório");
    }
    const input = parse(orderInputSchema, await ctx.json());
    const fingerprint = JSON.stringify(input);
    const scopedKey = `${ctx.user.id}:${key}`;

    const previous = ctx.db.idempotency[scopedKey];
    if (previous) {
      if (previous.fingerprint !== fingerprint) {
        throw new ApiFailure(409, "IDEMPOTENCY_CONFLICT", "Chave de idempotência reutilizada com conteúdo diferente");
      }
      const existing = ctx.db.orders.find((order) => order.id === previous.orderId);
      settleIfDue(existing!);
      return ok(toOrder(existing!));
    }

    const wallet = (ctx.db.wallets[ctx.user.id] ?? []).find((candidate) => candidate.id === input.walletId);
    if (!wallet) throw new ApiFailure(422, "VALIDATION_ERROR", "Carteira inválida", { walletId: "Selecione uma carteira cadastrada" });
    if (wallet.network !== input.network) {
      throw new ApiFailure(422, "VALIDATION_ERROR", "Rede incompatível", { network: "A rede deve ser a da carteira selecionada" });
    }

    const cart = getCartRecord(ctx.db, `user:${ctx.user.id}`);
    if (cart.items.length === 0) throw new ApiFailure(422, "VALIDATION_ERROR", "Carrinho vazio");

    const { behavior } = currentScenario();
    if (behavior.priceChangesOnCheckout && runtime.checkoutQuotes === 0) {
      runtime.checkoutQuotes += 1;
      bumpPrice(cart.items[0].nftId);
    }
    if (behavior.soldOutOnCheckout && runtime.checkoutQuotes === 0) {
      runtime.checkoutQuotes += 1;
      updateNft(cart.items[0].nftId, { available: 0 });
    }

    // Revalidate price, availability, coupon and fees: the API quote is the source of truth.
    const quote = computeQuote(ctx.db, cart);
    if (quote.issues.length > 0) {
      throw new ApiFailure(409, "OUT_OF_STOCK", "Alguns itens não estão mais disponíveis", undefined, { quote });
    }
    if (quote.id !== input.quoteId) {
      throw new ApiFailure(409, "PRICE_CHANGED", "Os valores do pedido mudaram. Revise e confirme novamente.", undefined, { quote });
    }

    const now = new Date().toISOString();
    const orderId = nextId("order", "o");
    const order = mutateDb((db) => {
      const record = {
        id: orderId,
        userId: ctx.user.id,
        input,
        status: "pending" as const,
        lines: quote.lines.map(({ nftId, name, image, quantity, unitPrice, lineTotal }) => ({ nftId, name, image, quantity, unitPrice, lineTotal })),
        subtotal: quote.subtotal,
        discount: quote.discount,
        networkFee: quote.networkFee,
        total: quote.total,
        ...(quote.couponCode ? { couponCode: quote.couponCode } : {}),
        network: input.network,
        wallet: { label: wallet.label, address: wallet.address, network: wallet.network },
        collector: input.collector,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      db.orders.push(record);
      db.idempotency[scopedKey] = { fingerprint, orderId };
      return toOrder(record);
    });

    setTimeout(() => settleOrder(orderId), ORDER_SETTLE_MS);

    if (behavior.orderTimeout && !runtime.orderResponseLost.has(scopedKey)) {
      // The order exists, but the client never sees the response: it must recover via the same key.
      runtime.orderResponseLost.add(scopedKey);
      return HttpResponse.error();
    }
    return ok(order, { status: 201 });
  }, { auth: true }),

  route("get", "/api/orders", (ctx) => {
    const status = ctx.url.searchParams.get("status");
    const orders: Order[] = ctx.db.orders
      .filter((order) => order.userId === ctx.user.id && (!status || order.status === status))
      .map((order) => {
        settleIfDue(order);
        return toOrder(order);
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return ok({ data: orders });
  }, { auth: true }),

  route("get", "/api/orders/:id", (ctx) => {
    const order = ctx.db.orders.find((candidate) => candidate.id === ctx.params.id && candidate.userId === ctx.user.id);
    // Same response for "missing" and "someone else's": no data exposure between users.
    if (!order) throw new ApiFailure(404, "NOT_FOUND", "Pedido não encontrado");
    settleIfDue(order);
    return ok(toOrder(order));
  }, { auth: true }),
];
