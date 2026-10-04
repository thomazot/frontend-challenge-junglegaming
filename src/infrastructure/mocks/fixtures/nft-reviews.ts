import type { NftReview } from "@/shared/api/contracts";

const REVIEW_COMMENTS = [
  "A arte é ainda mais impressionante pessoalmente. Excelente aquisição!",
  "Peça incrível, com ótimo nível de detalhe e uma entrega impecável.",
  "Uma das minhas obras favoritas da coleção. Recomendo!",
];

export const buildNftReviews = (nftId: string): NftReview[] =>
  Array.from({ length: nftId === "42" ? 19 : 0 }, (_, index) => ({
    id: `${nftId}-review-${index + 1}`,
    nftId,
    author: `Colecionador ${index + 1}`,
    score: index === 18 ? 1 : 5,
    comment: REVIEW_COMMENTS[index % REVIEW_COMMENTS.length],
    createdAt: new Date(Date.UTC(2026, 8, 30 - index)).toISOString(),
  }));
