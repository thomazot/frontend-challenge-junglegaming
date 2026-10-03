import type { NetworkId, Nft } from "@/shared/api/contracts";

const NAMES = ["Emerald Ape", "Sage Nomad", "Neon Vessel", "Cosmic Bloom", "Amber Relic", "Violet Echo", "Iron Totem", "Solar Drift"];
const CREATORS = ["Kuro Studio", "Atlas Labs", "Mira Vale", "Jungle Originals"];
const NETWORKS: NetworkId[] = ["Ethereum", "Polygon", "Solana"];
export const COLLECTIONS = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
] as const;

const BASE_TIME = Date.UTC(2026, 5, 1, 12, 0, 0);
const DAY_MS = 86_400_000;

/** Integer cents → decimal ETH string (no float arithmetic). */
const centsToEth = (cents: number) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;

/** Deterministic catalog: same output on every run (stable tests and snapshots). */
export const buildNfts = (): Nft[] =>
  Array.from({ length: 48 }, (_, index) => {
    const id = String(index + 1);
    const cents = ((index * 37) % 1228) + 2;
    const total = 5 + (index % 6) * 5;
    const available = index % 9 === 8 ? 0 : total - (index % 4);
    const hasDiscount = index % 5 === 2;
    return {
      id,
      name: `${NAMES[index % NAMES.length]} #${String((index * 53) % 999).padStart(3, "0")}`,
      description: `Edição digital exclusiva da coleção ${COLLECTIONS[index % COLLECTIONS.length]}.`,
      image: "/images/monkey-nft.jpg",
      collection: COLLECTIONS[index % COLLECTIONS.length],
      network: NETWORKS[index % NETWORKS.length],
      creator: CREATORS[index % CREATORS.length],
      price: centsToEth(cents),
      ...(hasDiscount ? { oldPrice: centsToEth(cents + 30) } : {}),
      ...(index % 7 === 1 ? { badge: `NFT Artwork ${String((index % 9) + 1).padStart(2, "0")}` } : {}),
      edition: { total, available },
      maxPerOrder: 3,
      version: 1,
      // Curatorial tags for catalog tabs: "new" (novos lançamentos), "trending" (em alta).
      tags: [index % 3 === 0 ? "new" : "", index % 4 === 0 ? "trending" : ""].filter(Boolean),
      updatedAt: new Date(BASE_TIME - index * DAY_MS).toISOString(),
    };
  });
