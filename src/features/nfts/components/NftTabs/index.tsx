import { useState } from "react";
import type { Nft } from "@/shared/api/contracts";
import { useNftReviews } from "../../hooks/use-nft-reviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useSlidingIndicator } from "@/shared/hooks/useSlidingIndicator";

const tabTriggerClassName =
  "group relative h-auto flex-none rounded-none border-0 bg-transparent px-0 py-3 font-mono text-[17px] leading-4 font-normal text-foreground shadow-none transition-colors after:hidden hover:text-foreground focus-visible:ring-0 data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-text-accent";

interface NftTabsProps {
  readonly nft: Nft;
}

export function NftTabs({ nft }: NftTabsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { containerRef, indicatorStyle } = useSlidingIndicator(activeTab);
  const reviewsQuery = useNftReviews(nft.id, 50);
  const reviewCount = reviewsQuery.data?.meta.total ?? nft.rating?.count ?? 0;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList
        ref={containerRef}
        variant="line"
        className="relative h-auto w-full justify-start gap-8 rounded-none border-b border-border bg-transparent p-0"
      >
        <TabsTrigger value="details" data-sliding-item="details" className={tabTriggerClassName}>
          Detalhes do NFT
        </TabsTrigger>
        <TabsTrigger value="reviews" data-sliding-item="reviews" className={tabTriggerClassName}>
          Avaliações de colecionadores ({reviewCount})
        </TabsTrigger>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 bg-text-accent transition-[transform,width] duration-300 ease-in-out motion-reduce:transition-none"
          style={indicatorStyle}
        />
      </TabsList>

      <TabsContent value="details" className="pt-6">
        <div className="flex max-w-3xl flex-col gap-4 font-mono text-sm leading-relaxed text-muted-foreground">
          <p>{nft.description}</p>
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="mb-1 font-bold text-foreground">Coleção:</dt>
              <dd>{nft.collection}</dd>
            </div>
            <div>
              <dt className="mb-1 font-bold text-foreground">Criador:</dt>
              <dd>{nft.creator}</dd>
            </div>
            <div>
              <dt className="mb-1 font-bold text-foreground">Rede:</dt>
              <dd>{nft.network}</dd>
            </div>
            <div>
              <dt className="mb-1 font-bold text-foreground">Edição disponível:</dt>
              <dd>
                {nft.edition.available}/{nft.edition.total}
              </dd>
            </div>
            {nft.attributes && (
              <div>
                <dt className="mb-1 font-bold text-foreground">Atributos:</dt>
                <dd>{nft.attributes.join(", ")}</dd>
              </div>
            )}
          </dl>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="pt-6">
        {reviewsQuery.isPending ? (
          <p role="status" className="font-mono text-sm text-muted-foreground">Carregando avaliações...</p>
        ) : reviewsQuery.isError ? (
          <p role="alert" className="font-mono text-sm text-text-coral">
            Não foi possível carregar as avaliações. Tente novamente.
          </p>
        ) : reviewsQuery.data.data.length === 0 ? (
          <p className="font-mono text-sm text-muted-foreground">Este NFT ainda não tem avaliações.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviewsQuery.data.data.map((review) => (
              <article key={review.id} className="flex gap-4 rounded-lg bg-card p-4">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-sm text-foreground"
                  aria-hidden="true"
                >
                  {review.author.charAt(0)}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{review.author}</span>
                    <span className="font-mono text-primary" aria-label={`Nota ${review.score} de 5`}>
                      {"★".repeat(review.score)}
                    </span>
                    <time className="font-mono text-xs text-muted-foreground" dateTime={review.createdAt}>
                      {new Intl.DateTimeFormat("pt-BR").format(new Date(review.createdAt))}
                    </time>
                  </div>
                  <p className="font-mono text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
