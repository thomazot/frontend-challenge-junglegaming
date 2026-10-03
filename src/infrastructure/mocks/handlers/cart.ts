import { cartItemSchema, cartQuantitySchema, couponSchema } from "@/shared/api/schemas";
import { mutateDb } from "../db";
import { assertCouponUsable, cartOwner, computeQuote, getCartRecord, toCart } from "../domain";
import { ApiFailure, ok, parse, route } from "../server";

const headersWith = (setCookie?: string) => {
  const headers = new Headers();
  if (setCookie) headers.append("Set-Cookie", setCookie);
  return headers;
};

const assertQuantity = (nft: { edition: { available: number }; maxPerOrder: number }, quantity: number) => {
  if (nft.edition.available === 0) throw new ApiFailure(409, "OUT_OF_STOCK", "Edição esgotada");
  if (quantity > nft.edition.available) {
    throw new ApiFailure(409, "OUT_OF_STOCK", `Restam apenas ${nft.edition.available} unidades`, undefined, { max: nft.edition.available });
  }
  if (quantity > nft.maxPerOrder) {
    throw new ApiFailure(409, "CONFLICT", `Limite de ${nft.maxPerOrder} por pedido`, undefined, { max: nft.maxPerOrder });
  }
};

export const cartHandlers = [
  route("get", "/api/cart", (ctx) => {
    const owner = cartOwner(ctx);
    const cart = mutateDb((db) => toCart(getCartRecord(db, owner.key)));
    return ok(cart, { headers: headersWith(owner.setCookie) });
  }),

  route("get", "/api/cart/quote", (ctx) => {
    const owner = cartOwner(ctx);
    const quote = mutateDb((db) => computeQuote(db, getCartRecord(db, owner.key)));
    return ok(quote, { headers: headersWith(owner.setCookie) });
  }),

  route("post", "/api/cart/items", async (ctx) => {
    const input = parse(cartItemSchema, await ctx.json());
    const nft = ctx.db.nfts.find((candidate) => candidate.id === input.nftId);
    if (!nft) throw new ApiFailure(404, "NOT_FOUND", "NFT não encontrado");
    const owner = cartOwner(ctx);
    const cart = mutateDb((db) => {
      const record = getCartRecord(db, owner.key);
      const existing = record.items.find((item) => item.nftId === input.nftId);
      assertQuantity(nft, (existing?.quantity ?? 0) + input.quantity);
      if (existing) existing.quantity += input.quantity;
      else record.items.push({ nftId: input.nftId, quantity: input.quantity });
      record.version += 1;
      return toCart(record);
    });
    return ok(cart, { status: 201, headers: headersWith(owner.setCookie) });
  }),

  route("patch", "/api/cart/items/:nftId", async (ctx) => {
    const { quantity } = parse(cartQuantitySchema, await ctx.json());
    const nft = ctx.db.nfts.find((candidate) => candidate.id === ctx.params.nftId);
    if (!nft) throw new ApiFailure(404, "NOT_FOUND", "NFT não encontrado");
    const owner = cartOwner(ctx);
    const cart = mutateDb((db) => {
      const record = getCartRecord(db, owner.key);
      const item = record.items.find((candidate) => candidate.nftId === nft.id);
      if (!item) throw new ApiFailure(404, "NOT_FOUND", "Item não está no carrinho");
      assertQuantity(nft, quantity);
      item.quantity = quantity;
      record.version += 1;
      return toCart(record);
    });
    return ok(cart, { headers: headersWith(owner.setCookie) });
  }),

  route("delete", "/api/cart/items/:nftId", (ctx) => {
    const owner = cartOwner(ctx);
    const cart = mutateDb((db) => {
      const record = getCartRecord(db, owner.key);
      record.items = record.items.filter((item) => item.nftId !== ctx.params.nftId);
      record.version += 1;
      return toCart(record);
    });
    return ok(cart, { headers: headersWith(owner.setCookie) });
  }),

  route("put", "/api/cart/coupon", async (ctx) => {
    const { code } = parse(couponSchema, await ctx.json());
    assertCouponUsable(code);
    const owner = cartOwner(ctx);
    const cart = mutateDb((db) => {
      const record = getCartRecord(db, owner.key);
      record.couponCode = code;
      record.version += 1;
      return toCart(record);
    });
    return ok(cart, { headers: headersWith(owner.setCookie) });
  }),

  route("delete", "/api/cart/coupon", (ctx) => {
    const owner = cartOwner(ctx);
    const cart = mutateDb((db) => {
      const record = getCartRecord(db, owner.key);
      delete record.couponCode;
      record.version += 1;
      return toCart(record);
    });
    return ok(cart, { headers: headersWith(owner.setCookie) });
  }),
];
