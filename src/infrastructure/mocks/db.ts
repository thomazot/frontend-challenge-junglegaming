import type { Nft, Order, OrderInput, Wallet } from "@/shared/api/contracts";
import { buildNfts } from "./fixtures/nfts";
import { SEED_USERS, SEED_WALLETS } from "./fixtures/accounts";
import { DEFAULT_SCENARIO_ID, findScenario } from "./scenarios";

const STORAGE_KEY = "mocks:db:v1";
const PBKDF2_ITERATIONS = 100_000;

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  document?: string;
  createdAt: string;
  passwordHash: string;
  passwordSalt: string;
}

export interface SessionRecord {
  userId: string;
  csrf: string;
  expiresAt: number;
}

export interface CartRecord {
  items: { nftId: string; quantity: number }[];
  couponCode?: string;
  version: number;
}

export interface OrderRecord extends Order {
  userId: string;
  input: OrderInput;
}

export interface DbState {
  scenarioId: string;
  counters: Record<string, number>;
  users: UserRecord[];
  sessions: Record<string, SessionRecord>;
  nfts: Nft[];
  favorites: Record<string, string[]>;
  /** Keyed by `user:<id>` or `guest:<id>`. */
  carts: Record<string, CartRecord>;
  wallets: Record<string, Wallet[]>;
  orders: OrderRecord[];
  idempotency: Record<string, { fingerprint: string; orderId: string }>;
}

/** Volatile (non-persisted) scenario bookkeeping; cleared on reset. */
export interface Runtime {
  failedOnce: Set<string>;
  loginAttempts: Map<string, number[]>;
  checkoutQuotes: number;
  orderResponseLost: Set<string>;
}

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

export const randomToken = (size = 32) => bytesToHex(crypto.getRandomValues(new Uint8Array(size)));

export const hashPassword = async (password: string, saltHex: string): Promise<string> => {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g) ?? [], (h) => parseInt(h, 16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
};

const seed = async (scenarioId: string): Promise<DbState> => {
  const users: UserRecord[] = [];
  for (const user of SEED_USERS) {
    const passwordSalt = randomToken(16);
    users.push({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: "2026-01-10T10:00:00.000Z",
      passwordSalt,
      passwordHash: await hashPassword(user.password, passwordSalt),
    });
  }
  return {
    scenarioId,
    counters: { order: 0, wallet: 10, user: 10, event: 0, guest: 0 },
    users,
    sessions: {},
    nfts: buildNfts(),
    favorites: { "u-1": ["2", "5"], "u-2": [] },
    carts: {},
    wallets: structuredClone(SEED_WALLETS),
    orders: [],
    idempotency: {},
  };
};

const freshRuntime = (): Runtime => ({
  failedOnce: new Set(),
  loginAttempts: new Map(),
  checkoutQuotes: 0,
  orderResponseLost: new Set(),
});

let state: DbState | undefined;
export let runtime: Runtime = freshRuntime();

const persist = () => {
  if (!state) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode / quota); the mock keeps working in memory.
  }
};

export const initDb = async (): Promise<DbState> => {
  if (state) return state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DbState;
      if (Array.isArray(parsed.nfts) && Array.isArray(parsed.users)) {
        state = parsed;
        return state;
      }
    }
  } catch {
    // Corrupted snapshot: fall through to a clean seed.
  }
  state = await seed(DEFAULT_SCENARIO_ID);
  persist();
  return state;
};

export const getDb = (): DbState => {
  if (!state) throw new Error("Mock database not initialised");
  return state;
};

/** Applies a mutation and persists it, so refresh keeps the simulated backend state. */
export const mutateDb = <T>(mutation: (db: DbState) => T): T => {
  const result = mutation(getDb());
  persist();
  return result;
};

export const resetDb = async (scenarioId?: string): Promise<DbState> => {
  state = await seed(findScenario(scenarioId ?? state?.scenarioId).id);
  runtime = freshRuntime();
  persist();
  return state;
};

export const setScenario = (scenarioId: string) => {
  const scenario = findScenario(scenarioId);
  mutateDb((db) => {
    db.scenarioId = scenario.id;
  });
  runtime = freshRuntime();
  return scenario;
};

export const currentScenario = () => findScenario(getDb().scenarioId);

export const nextId = (counter: string, prefix: string) =>
  mutateDb((db) => {
    db.counters[counter] = (db.counters[counter] ?? 0) + 1;
    return `${prefix}-${db.counters[counter]}`;
  });
