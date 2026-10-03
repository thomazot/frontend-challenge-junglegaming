import type { EthString } from "@/shared/lib/eth";

export type { EthString };

/* ------------------------------ Errors ------------------------------ */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "SESSION_EXPIRED"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "CSRF_REJECTED"
  | "NOT_FOUND"
  | "EMAIL_TAKEN"
  | "CONFLICT"
  | "COUPON_INVALID"
  | "COUPON_EXPIRED"
  | "PRICE_CHANGED"
  | "OUT_OF_STOCK"
  | "QUOTE_STALE"
  | "IDEMPOTENCY_CONFLICT"
  | "IDEMPOTENCY_KEY_REQUIRED"
  | "PAYMENT_DECLINED"
  | "WALLET_REJECTED"
  | "RATE_LIMITED"
  | "TRANSIENT";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: Record<string, string>;
    details?: unknown;
  };
}

/* ------------------------------- NFTs -------------------------------- */
export type NetworkId = "Ethereum" | "Polygon" | "Solana";
export type NftSort = "recent" | "price-asc" | "price-desc";

export interface Nft {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  network: NetworkId;
  creator: string;
  price: EthString;
  oldPrice?: EthString;
  badge?: string;
  edition: { total: number; available: number };
  maxPerOrder: number;
  /** Monotonic per-resource version, used to discard stale events/responses. */
  version: number;
  updatedAt: string;
}

export interface NftListParams {
  q?: string;
  collection?: string[];
  network?: NetworkId[];
  minPrice?: EthString;
  maxPrice?: EthString;
  sort?: NftSort;
  page?: number;
  limit?: number;
}

export interface FacetCount {
  label: string;
  count: number;
}

export interface NftListResponse {
  data: Nft[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  facets: {
    collections: FacetCount[];
    networks: FacetCount[];
    priceRange: { min: EthString; max: EthString };
  };
}

/* ------------------------------ Session ------------------------------ */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  expiresAt: string;
  csrfToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/* ------------------------------ Profile ------------------------------ */
export interface Profile extends User {
  phone?: string;
  document?: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  document?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/* ------------------------------ Wallets ------------------------------ */
export type WalletKind = "primary" | "secondary";

export interface Wallet {
  id: string;
  label: string;
  address: string;
  network: NetworkId;
  kind: WalletKind;
}

export type WalletInput = Omit<Wallet, "id">;

/* ------------------------------- Cart -------------------------------- */
export interface CartItem {
  nftId: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  version: number;
}

export type QuoteIssueCode = "OUT_OF_STOCK" | "QUANTITY_LIMIT" | "PRICE_CHANGED";

export interface QuoteIssue {
  nftId: string;
  code: QuoteIssueCode;
  message: string;
}

export interface QuoteLine {
  nftId: string;
  name: string;
  image: string;
  network: NetworkId;
  unitPrice: EthString;
  quantity: number;
  lineTotal: EthString;
  available: number;
}

export interface Quote {
  /** Deterministic fingerprint of prices, availability, coupon and fees. */
  id: string;
  lines: QuoteLine[];
  subtotal: EthString;
  discount: EthString;
  networkFee: EthString;
  total: EthString;
  couponCode?: string;
  issues: QuoteIssue[];
  generatedAt: string;
}

/* ------------------------------ Orders ------------------------------- */
export type OrderStatus = "pending" | "confirmed" | "declined";

export interface OrderInput {
  quoteId: string;
  walletId: string;
  network: NetworkId;
  collector: { fullName: string; email: string };
}

export interface OrderLine {
  nftId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: EthString;
  lineTotal: EthString;
}

export interface Order {
  id: string;
  status: OrderStatus;
  /** Snapshot: never changes after creation, regardless of catalog updates. */
  lines: OrderLine[];
  subtotal: EthString;
  discount: EthString;
  networkFee: EthString;
  total: EthString;
  couponCode?: string;
  network: NetworkId;
  wallet: Pick<Wallet, "label" | "address" | "network">;
  collector: { fullName: string; email: string };
  txHash?: string;
  explorerUrl?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

/* ------------------------------ Realtime ----------------------------- */
interface BaseEvent<T extends string, R extends string, P> {
  /** Stable identity: duplicates share the same id. */
  id: string;
  type: T;
  resource: { type: R; id: string };
  version: number;
  at: string;
  payload: P;
}

export type NftUpdatedEvent = BaseEvent<
  "nft.updated",
  "nft",
  { price: EthString; oldPrice?: EthString; available: number }
>;

export type OrderUpdatedEvent = BaseEvent<
  "order.updated",
  "order",
  { status: OrderStatus; txHash?: string; declineReason?: string }
>;

export type RealtimeEvent = NftUpdatedEvent | OrderUpdatedEvent;
