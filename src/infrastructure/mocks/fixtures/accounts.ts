import type { NetworkId, WalletKind } from "@/shared/api/contracts";

/**
 * Fictional credentials for the mock environment (documented in README).
 * Passwords are hashed with PBKDF2 + per-user salt when the database is seeded.
 */
export const SEED_USERS = [
  { id: "u-1", name: "Ana Colecionadora", email: "ana@jungle.test", password: "Jungle#2024-ana" },
  { id: "u-2", name: "Bruno Minter", email: "bruno@jungle.test", password: "Jungle#2024-bruno" },
] as const;

export const SEED_WALLETS: Record<
  string,
  { id: string; label: string; address: string; network: NetworkId; kind: WalletKind }[]
> = {
  "u-1": [
    { id: "w-1", label: "Carteira principal", address: "0x52908400098527886E0F7030069857D2E4169EE7", network: "Ethereum", kind: "primary" },
  ],
  "u-2": [
    { id: "w-2", label: "Carteira principal", address: "0x8617E340B3D01FA5F11F306F4090FD50E238070D", network: "Polygon", kind: "primary" },
  ],
};

export interface Coupon {
  code: string;
  basisPoints: number;
  expiresAt: string;
}

export const COUPONS: Coupon[] = [
  { code: "WELCOME10", basisPoints: 1000, expiresAt: "2099-12-31T23:59:59.000Z" },
  { code: "JUNGLE20", basisPoints: 2000, expiresAt: "2099-12-31T23:59:59.000Z" },
  { code: "EXPIRED10", basisPoints: 1000, expiresAt: "2020-01-01T00:00:00.000Z" },
];
