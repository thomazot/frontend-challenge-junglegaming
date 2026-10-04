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
const FEATURED_APE: Pick<Nft, "name" | "description" | "collection" | "creator" | "price" | "rating" | "serial" | "attributes" | "edition"> = {
  name: "Emerald Ape #042",
  description: "Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.",
  collection: "Kurio Apes",
  creator: "Kurio Editions",
  price: "1.19",
  rating: { score: 4.8, count: 19 },
  serial: { number: 1, total: 50 },
  attributes: ["Óculos", "Esmeralda", "Raro"],
  edition: { total: 10, available: 10 },
} satisfies Partial<Nft>;

const RELATED_APES: Record<number, { name: string; price: string; image: string }> = {
  1: { name: "Jade Guardian #118", price: "1.09", image: "/images/emerald-ape-042.png" },
  2: { name: "Moss Keeper #072", price: "0.89", image: "/images/violet-nomad.png" },
  3: { name: "Verdant Seeker #205", price: "1.49", image: "/images/ivory-baron.png" },
  4: { name: "Ivory Baron #088", price: "1.79", image: "/images/ivory-baron.png" },
  5: { name: "Jungle Oracle #031", price: "1.19", image: "/images/golden-beat.png" },
  6: { name: "Sage Nomad #009", price: "1.29", image: "/images/violet-nomad.png" },
  7: { name: "Amber Guardian #144", price: "0.99", image: "/images/emerald-ape-042.png" },
  8: { name: "Violet Nomad #314", price: "1.39", image: "/images/violet-nomad.png" },
  9: { name: "Ivory Seeker #062", price: "1.59", image: "/images/ivory-baron.png" },
  10: { name: "Golden Oracle #093", price: "1.09", image: "/images/golden-beat.png" },
  11: { name: "Forest Relic #217", price: "1.79", image: "/images/emerald-ape-042.png" },
  12: { name: "Canopy Keeper #072", price: "0.89", image: "/images/emerald-ape-042.png" },
  13: { name: "Jade Nomad #083", price: "1.29", image: "/images/violet-nomad.png" },
  14: { name: "Golden Seeker #196", price: "0.99", image: "/images/golden-beat.png" },
  15: { name: "Emerald Oracle #055", price: "1.39", image: "/images/ivory-baron.png" },
  16: { name: "Ivory Baron #088", price: "1.79", image: "/images/ivory-baron.png" },
  20: { name: "Verdant Seeker #205", price: "1.49", image: "/images/violet-nomad.png" },
  24: { name: "Golden Beat #287", price: "0.99", image: "/images/golden-beat.png" },
  28: { name: "Jungle Oracle #031", price: "1.19", image: "/images/ivory-baron.png" },
  32: { name: "Sage Nomad #009", price: "1.29", image: "/images/violet-nomad.png" },
  40: { name: "Golden Beat #207", price: "0.99", image: "/images/golden-beat.png" },
};

/** Integer cents → decimal ETH string (no float arithmetic). */
const centsToEth = (cents: number) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;

/** Convert display name to URL slug: "Emerald Ape #000" → "emerald-ape-000" */
const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getNftId = (index: number, isFeatured: boolean) => {
  if (isFeatured) return "42";
  return String(index > 40 ? index + 2 : index + 1);
};

const getFeaturedFields = (isFeatured: boolean): Partial<Nft> => {
  if (!isFeatured) return {};
  return {
    rating: FEATURED_APE.rating,
    serial: FEATURED_APE.serial,
    attributes: FEATURED_APE.attributes,
  };
};

const getOptionalPrice = (index: number, relatedApe: boolean, cents: number) => {
  if (relatedApe || index % 5 !== 2) return {};
  return { oldPrice: centsToEth(cents + 30) };
};

const getOptionalBadge = (index: number, relatedApe: boolean) => {
  if (relatedApe || index % 7 !== 1) return {};
  return { badge: `NFT Artwork ${String((index % 9) + 1).padStart(3, "0")}` };
};

const buildNft = (index: number): Nft => {
  const isFeatured = index === 0;
  const relatedApe = RELATED_APES[index];
  const generatedName = `${NAMES[index % NAMES.length]} #${String((index * 53) % 999).padStart(3, "0")}`;
  const name = isFeatured ? FEATURED_APE.name : relatedApe?.name ?? generatedName;
  const cents = ((index * 37) % 1228) + 2;
  const total = 5 + (index % 6) * 5;

  return {
    id: getNftId(index, isFeatured),
    slug: isFeatured ? "emerald-ape-000" : slugify(name),
    name,
    description: isFeatured
      ? FEATURED_APE.description
      : `Edição digital exclusiva da coleção ${COLLECTIONS[index % COLLECTIONS.length]}.`,
    image: isFeatured ? "/images/emerald-ape-042.png" : relatedApe?.image ?? "/images/monkey-nft.jpg",
    ...(isFeatured
      ? {
          galleryImages: [
            "/images/emerald-ape-042.png",
            "/images/violet-nomad.png",
            "/images/ivory-baron.png",
            "/images/golden-beat.png",
            "/images/monkey-nft.jpg",
          ],
        }
      : {}),
    collection: isFeatured || relatedApe ? "Kurio Apes" : COLLECTIONS[index % COLLECTIONS.length],
    network: NETWORKS[index % NETWORKS.length],
    creator: isFeatured ? FEATURED_APE.creator : CREATORS[index % CREATORS.length],
    price: isFeatured ? FEATURED_APE.price : relatedApe?.price ?? centsToEth(cents),
    ...getFeaturedFields(isFeatured),
    ...getOptionalPrice(index, Boolean(relatedApe), cents),
    ...getOptionalBadge(index, Boolean(relatedApe)),
    edition: isFeatured ? FEATURED_APE.edition : { total, available: index % 9 === 8 ? 0 : total - (index % 4) },
    maxPerOrder: 3,
    version: 1,
    // Curatorial tags for catalog tabs: "new" (novos lançamentos), "trending" (em alta).
    tags: [index % 3 === 0 ? "new" : "", index % 4 === 0 ? "trending" : ""].filter(Boolean),
    updatedAt: new Date(BASE_TIME - index * DAY_MS).toISOString(),
  };
};

/** Deterministic catalog: same output on every run (stable tests and snapshots). */
export const buildNfts = (): Nft[] => Array.from({ length: 48 }, (_, index) => buildNft(index));
