import type { Cart, Nft, NftUpdatedEvent, Order, OrderUpdatedEvent, Quote, QuoteIssue, User } from "@/shared/api/contracts";
import { addEth, compareEth, fromWei, mulEthInt, percentEth, subEth, toWei } from "@/shared/lib/eth";
import { getDb, mutateDb, nextId, type CartRecord, type DbState, type OrderRecord, type UserRecord } from "./db";
import { COUPONS } from "./fixtures/accounts";
import { publishEvent } from "./events";
import { ApiFailure, type RouteContext } from "./server";

export const publicUser = (user: UserRecord): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
});

/* -------------------------------- Cookies -------------------------------- */
export const cookieHeader = (name: string, value: string, maxAgeSeconds?: number) => {
  const maxAge = maxAgeSeconds !== undefined ? `; Max-Age=${maxAgeSeconds}` : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${maxAge}`;
};

/* --------------------------------- Cart ---------------------------------- */
export const cartOwner = (ctx: RouteContext): { key: string; setCookie?: string } => {
  if (ctx.maybeUser) return { key: `user:${ctx.maybeUser.id}` };
  const guest = ctx.cookies.guest;
  if (guest && /^g-[0-9a-f]{16}$/.test(guest)) return { key: `guest:${guest}` };
  const id = `g-${Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("")}`;
  return { key: `guest:${id}`, setCookie: cookieHeader("guest", id, 60 * 60 * 24 * 30) };
};

export const getCartRecord = (db: DbState, key: string): CartRecord => {
  db.carts[key] ??= { items: [], version: 0 };
  return db.carts[key];
};

export const toCart = (record: CartRecord): Cart => ({
  items: record.items.map((item) => ({ ...item })),
  ...(record.couponCode ? { couponCode: record.couponCode } : {}),
  version: record.version,
});

export const mergeGuestCart = (guestKey: string, userKey: string) =>
  mutateDb((db) => {
    const guest = db.carts[guestKey];
    if (!guest || guest.items.length === 0) return;
    const target = getCartRecord(db, userKey);
    for (const item of guest.items) {
      const existing = target.items.find((candidate) => candidate.nftId === item.nftId);
      const nft = db.nfts.find((candidate) => candidate.id === item.nftId);
      const cap = nft ? Math.min(nft.maxPerOrder, nft.edition.available) : 0;
      const quantity = Math.min((existing?.quantity ?? 0) + item.quantity, cap);
      if (quantity <= 0) continue;
      if (existing) existing.quantity = quantity;
      else target.items.push({ nftId: item.nftId, quantity });
    }
    target.couponCode ??= guest.couponCode;
    target.version += 1;
    delete db.carts[guestKey];
  });

/* --------------------------------- Quote --------------------------------- */
const hash = (value: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.codePointAt(i)!;
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
};

export const findCoupon = (code: string) => COUPONS.find((coupon) => coupon.code === code);

export const assertCouponUsable = (code: string) => {
  const coupon = findCoupon(code);
  if (!coupon) throw new ApiFailure(422, "COUPON_INVALID", "Cupom inválido", { code: "Cupom inválido" });
  if (Date.parse(coupon.expiresAt) <= Date.now()) {
    throw new ApiFailure(422, "COUPON_EXPIRED", "Cupom expirado", { code: "Cupom expirado" });
  }
  return coupon;
};

const MIN_FEE = "0.001";

export const computeQuote = (db: DbState, cart: CartRecord): Quote => {
  const issues: QuoteIssue[] = [];
  const lines = cart.items.flatMap((item) => {
    const nft = db.nfts.find((candidate) => candidate.id === item.nftId);
    if (!nft) return [];
    if (item.quantity > nft.edition.available) {
      issues.push({
        nftId: nft.id,
        code: "OUT_OF_STOCK",
        message: nft.edition.available === 0 ? "Edição esgotada" : `Restam apenas ${nft.edition.available} unidades`,
      });
    } else if (item.quantity > nft.maxPerOrder) {
      issues.push({ nftId: nft.id, code: "QUANTITY_LIMIT", message: `Limite de ${nft.maxPerOrder} por pedido` });
    }
    return [
      {
        nftId: nft.id,
        name: nft.name,
        image: nft.image,
        network: nft.network,
        unitPrice: nft.price,
        quantity: item.quantity,
        lineTotal: mulEthInt(nft.price, item.quantity),
        available: nft.edition.available,
      },
    ];
  });

  const subtotal = lines.reduce((sum, line) => addEth(sum, line.lineTotal), "0");
  const coupon = cart.couponCode ? findCoupon(cart.couponCode) : undefined;
  const validCoupon = coupon && Date.parse(coupon.expiresAt) > Date.now() ? coupon : undefined;
  const discount = validCoupon ? percentEth(subtotal, validCoupon.basisPoints) : "0";
  const base = subEth(subtotal, discount);
  const fee = lines.length === 0 ? "0" : [percentEth(base, 100), MIN_FEE].reduce((a, b) => (compareEth(a, b) >= 0 ? a : b), "0");
  const total = addEth(base, fee);

  const id = hash(
    JSON.stringify([lines.map((l) => [l.nftId, l.unitPrice, l.quantity, l.available >= l.quantity]), validCoupon?.code, fee]),
  );
  return {
    id,
    lines,
    subtotal,
    discount,
    networkFee: fee,
    total,
    ...(validCoupon ? { couponCode: validCoupon.code } : {}),
    issues,
    generatedAt: new Date().toISOString(),
  };
};

/* ---------------------------- Catalog mutations --------------------------- */
const emitNftUpdated = (nft: Nft) => {
  const event: NftUpdatedEvent = {
    id: nextId("event", "evt"),
    type: "nft.updated",
    resource: { type: "nft", id: nft.id },
    version: nft.version,
    at: new Date().toISOString(),
    payload: { price: nft.price, ...(nft.oldPrice ? { oldPrice: nft.oldPrice } : {}), available: nft.edition.available },
  };
  publishEvent({ event });
};

/** Single write path for catalog changes: REST responses and realtime events stay in sync. */
export const updateNft = (id: string, change: { price?: string; available?: number }): Nft => {
  const nft = mutateDb((db) => {
    const target = db.nfts.find((candidate) => candidate.id === id);
    if (!target) throw new ApiFailure(404, "NOT_FOUND", "NFT não encontrado");
    if (change.price !== undefined && change.price !== target.price) {
      target.oldPrice = target.price;
      target.price = change.price;
    }
    if (change.available !== undefined) target.edition.available = Math.max(0, Math.min(change.available, target.edition.total));
    target.version += 1;
    target.updatedAt = new Date().toISOString();
    return structuredClone(target);
  });
  emitNftUpdated(nft);
  return nft;
};

export const bumpPrice = (id: string, byEth = "0.05") => {
  const nft = getDb().nfts.find((candidate) => candidate.id === id);
  if (nft) updateNft(id, { price: fromWei(toWei(nft.price) + toWei(byEth)) });
};

/* -------------------------------- Orders --------------------------------- */
export const toOrder = ({ userId: _userId, input: _input, ...order }: OrderRecord): Order => order;

const EXPLORERS = {
  Ethereum: "https://etherscan.io/tx/",
  Polygon: "https://polygonscan.com/tx/",
  Solana: "https://solscan.io/tx/",
} as const;

export const ORDER_SETTLE_MS = 1500;

/** Terminal states are final: finalising twice is a no-op (idempotent). */
export const settleOrder = (orderId: string) => {
  const settled = mutateDb((db) => {
    const order = db.orders.find((candidate) => candidate.id === orderId);
    if (order?.status !== "pending") return undefined;
    const declined = db.scenarioId === "payment-declined";
    order.updatedAt = new Date().toISOString();
    order.version += 1;

    if (declined) {
      order.status = "declined";
      order.declineReason = "Pagamento recusado pela carteira";
    } else {
      order.status = "confirmed";
      order.txHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("")}`;
      order.explorerUrl = `${EXPLORERS[order.network]}${order.txHash}`;
      const cart = getCartRecord(db, `user:${order.userId}`);
      for (const line of order.lines) {
        const nft = db.nfts.find((candidate) => candidate.id === line.nftId);
        if (nft) {
          nft.edition.available = Math.max(0, nft.edition.available - line.quantity);
          nft.version += 1;
          nft.updatedAt = order.updatedAt;
        }
        // Only the purchased quantity leaves the cart.
        const item = cart.items.find((candidate) => candidate.nftId === line.nftId);
        if (item) item.quantity -= line.quantity;
      }
      cart.items = cart.items.filter((item) => item.quantity > 0);
      cart.version += 1;
    }
    return { order: structuredClone(order), touched: order.lines.map((line) => line.nftId) };
  });
  if (!settled) return;

  const { order, touched } = settled;
  if (order.status === "confirmed") {
    for (const nft of getDb().nfts.filter((candidate) => touched.includes(candidate.id))) emitNftUpdated(nft);
  }
  const event: OrderUpdatedEvent = {
    id: nextId("event", "evt"),
    type: "order.updated",
    resource: { type: "order", id: order.id },
    version: order.version,
    at: order.updatedAt,
    payload: {
      status: order.status,
      ...(order.txHash ? { txHash: order.txHash } : {}),
      ...(order.declineReason ? { declineReason: order.declineReason } : {}),
    },
  };
  publishEvent({ event, audienceUserId: order.userId });
};

export const settleIfDue = (order: OrderRecord) => {
  if (order.status === "pending" && Date.now() - Date.parse(order.createdAt) >= ORDER_SETTLE_MS) settleOrder(order.id);
};

export { runtime } from "./db";
