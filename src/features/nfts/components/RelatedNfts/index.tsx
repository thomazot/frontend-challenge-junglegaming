import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listNfts } from "@/infrastructure/http";
import type { Nft } from "@/shared/api/contracts";
import { NFTCard } from "../NFTCard";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/carousel";

interface RelatedNftsProps {
  readonly currentNft: Nft;
}

export function RelatedNfts({ currentNft }: RelatedNftsProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const { data, isError } = useQuery({
    queryKey: ["nfts", { collection: [currentNft.collection], limit: 48 }],
    queryFn: ({ signal }) => listNfts({ collection: [currentNft.collection], limit: 48 }, signal),
  });

  const related = data?.data.filter((nft) => nft.id !== currentNft.id).slice(0, 15) ?? [];

  const onCarouselSelect = useCallback((api: CarouselApi) => {
    setSelectedSnap(api.selectedScrollSnap());
    setSnapCount(api.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    onCarouselSelect(carouselApi);
    carouselApi.on("select", onCarouselSelect);
    carouselApi.on("reInit", onCarouselSelect);

    return () => {
      carouselApi.off("select", onCarouselSelect);
      carouselApi.off("reInit", onCarouselSelect);
    };
  }, [carouselApi, onCarouselSelect]);

  if (isError) {
    return <p role="alert" className="text-sm text-text-coral">Não foi possível carregar os NFTs desta coleção.</p>;
  }
  if (related.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <div className="border-b border-border">
        <h2 className="w-fit pb-3 font-mono text-[17px] font-bold text-primary">
          Mais desta coleção
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
          slidesToScroll: 5,
        }}
        setApi={setCarouselApi}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {related.map((nft) => (
            <CarouselItem key={nft.id} className="basis-1/3 pl-4 lg:basis-1/5">
              <NFTCard
                id={nft.id}
                slug={nft.slug}
                name={nft.name}
                price={nft.price}
                oldPrice={nft.oldPrice}
                image={nft.image}
                collection={nft.collection}
                network={nft.network}
                badge={nft.badge}
                decimalSeparator="."
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center gap-2">
        {Array.from({ length: snapCount }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Ir para grupo ${index + 1}`}
            aria-current={selectedSnap === index ? "true" : undefined}
            onClick={() => carouselApi?.scrollTo(index)}
            className={`size-3 rounded-full border border-primary transition-colors ${
              selectedSnap === index ? "bg-primary" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
