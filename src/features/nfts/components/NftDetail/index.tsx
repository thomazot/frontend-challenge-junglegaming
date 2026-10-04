import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Nft } from "@/shared/api/contracts";
import { Card } from "@/shared/ui/card";
import { NftFavoriteButton } from "../NftFavoriteButton";
import { NftGallery } from "../NftGallery";
import { NftInfo } from "../NftInfo";

const NftTabs = lazy(() => import("../NftTabs").then((module) => ({ default: module.NftTabs })));
const RelatedNfts = lazy(() => import("../RelatedNfts").then((module) => ({ default: module.RelatedNfts })));

interface NftDetailProps {
  readonly nft: Nft;
}

export function NftDetail({ nft }: NftDetailProps) {
  const [isLargeScreen, setIsLargeScreen] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [isRelatedNftsNear, setIsRelatedNftsNear] = useState(false);
  const relatedNftsRef = useRef<HTMLDivElement>(null);
  const galleryImages = nft.galleryImages?.length ? nft.galleryImages : [nft.image];

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const updateIsLargeScreen = () => setIsLargeScreen(media.matches);
    media.addEventListener("change", updateIsLargeScreen);
    return () => media.removeEventListener("change", updateIsLargeScreen);
  }, []);

  useEffect(() => {
    const element = relatedNftsRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setIsRelatedNftsNear(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsRelatedNftsNear(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col gap-4 rounded-[40px] bg-surface-raised pt-4 md:pt-0 pb-40 md:min-h-0 md:gap-24 md:rounded-none md:bg-transparent md:pb-16 ">
      <section className="flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between md:hidden">
          <a
            href="/"
            className="flex size-8.75 flex-col items-center justify-center gap-2.5 self-stretch rounded-[17.5px] border border-border bg-surface-raised text-foreground"
            aria-label="Voltar ao mercado"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </a>
          <NftFavoriteButton
            nftId={nft.id}
            compact
            className="flex size-8.75 flex-col items-center justify-center gap-2.5 self-stretch rounded-[17.5px] border border-border bg-surface-raised text-primary"
          />
        </div>

        {/* Breadcrumb */}
        <nav className="hidden items-center gap-2 text-[15px] font-bold text-foreground md:flex" aria-label="Breadcrumb">
          <a href="/" className="transition-colors hover:text-primary">Início</a>
          <span aria-hidden="true">/</span>
          <a href="/" className="transition-colors hover:text-primary">Mercado</a>
          <span aria-hidden="true">/</span>
          <span>{nft.name}</span>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 items-start gap-0 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
          <div className="min-w-0">
            <NftGallery
              images={galleryImages.map((src, index) => ({ id: `${nft.id}-image-${index}`, src }))}
              name={nft.name}
            />
          </div>
          <Card className="relative z-10 -mx-4 -mt-8 min-w-0 gap-0 rounded-t-3xl rounded-b-none border-0 bg-surface-card px-8 py-5 shadow-none md:mx-0 md:mt-0 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none">
            <NftInfo nft={nft} />
          </Card>
        </div>
      </section>

      {/* Tabs */}
      <div className="hidden lg:block">
        {isLargeScreen && (
          <Suspense fallback={null}>
            <NftTabs nft={nft} />
          </Suspense>
        )}
      </div>

      {/* Related NFTs */}
      <div ref={relatedNftsRef}>
        {isRelatedNftsNear && (
          <Suspense fallback={null}>
            <RelatedNfts currentNft={nft} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
