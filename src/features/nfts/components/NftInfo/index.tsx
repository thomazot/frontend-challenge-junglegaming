import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Nft } from "@/shared/api/contracts";
import { Icon } from "@/shared/components/Icon";
import { NftFavoriteButton } from "../NftFavoriteButton";
import { useNftReviews } from "../../hooks/use-nft-reviews";
import { addCartItem } from "@/infrastructure/http/cart-api";
import { toApiError } from "@/shared/api/http";
import { formatEth, mulEthInt } from "@/shared/lib/eth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { cva } from "class-variance-authority";

const floatingPurchaseFooterVariants = cva(
  "fixed inset-x-0 bottom-0 z-50 flex w-screen flex-col gap-4 px-5 pt-5 pb-6 md:hidden",
  {
    variants: {
      surface: {
        card: "bg-surface-card",
      },
      corners: {
        rounded: "rounded-t-[40px]",
      },
      elevation: {
        floating: "shadow-[0_0_20px_0_rgba(10,6,4,0.45)]",
      },
    },
    defaultVariants: {
      surface: "card",
      corners: "rounded",
      elevation: "floating",
    },
  },
);

interface NftInfoProps {
  readonly nft: Nft;
  readonly onActionError: (message?: string) => void;
}

export function NftInfo({ nft, onActionError }: NftInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();
  const reviewsQuery = useNftReviews(nft.id, 1);
  const rating = reviewsQuery.data
    ? { score: reviewsQuery.data.meta.average, count: reviewsQuery.data.meta.total }
    : nft.rating;
  const addToCartMutation = useMutation({
    mutationFn: () => addCartItem({ nftId: nft.id, quantity }),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      onActionError();
    },
    onError: (error) => onActionError(toApiError(error).message),
  });
  const addToCart = () => {
    onActionError();
    addToCartMutation.mutate();
  };

  const totalPrice = formatEth(mulEthInt(nft.price, quantity), 2, ".");
  const unitPrice = formatEth(nft.price, 2, ".");
  const maxQuantity = Math.min(nft.maxPerOrder, nft.edition.available);
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
  const shareLinks = [
    {
      id: "linkedin",
      label: "Compartilhar no LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: "email",
      label: "Compartilhar por e-mail",
      href: `mailto:?subject=${encodeURIComponent(nft.name)}&body=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: "twitter",
      label: "Compartilhar no Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(nft.name)}`,
    },
  ] as const;

  const decrement = () => setQuantity((current) => Math.max(1, current - 1));
  const increment = () => setQuantity((current) => Math.min(maxQuantity, current + 1));

  return (
    <div className="flex flex-col gap-5 text-text-secondary md:gap-6">
      <header className="-mb-2 flex flex-col gap-3 md:mb-0">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-mono text-xl font-bold leading-7 text-foreground md:text-3xl">{nft.name}</h1>
          {rating && <Rating rating={rating} className="md:hidden" />}
        </div>
        <div className="hidden flex-col gap-2 md:flex">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[22px] font-bold text-primary">{unitPrice} ETH</span>
              {nft.oldPrice && (
                <span className="font-mono text-sm text-text-secondary/70 line-through">
                  {formatEth(nft.oldPrice, 2, ".")} ETH
                </span>
              )}
            </div>
            {rating && <DesktopRating rating={rating} />}
          </div>
          <Separator className="bg-border-soft" />
        </div>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="hidden font-mono text-sm font-bold text-foreground md:block">Sobre este NFT</h2>
        <p className="text-sm font-normal leading-5 text-text-secondary md:font-mono md:leading-6">{nft.description}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[15px] font-bold text-foreground md:font-mono md:text-sm">Edição</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-text-secondary">{quantity}/{nft.edition.available}</span>
          <span className="font-mono text-xs text-text-secondary">1/{nft.edition.total}</span>
          {nft.serial && (
            <Badge variant="outline" className="border-primary px-2 py-1 font-mono text-xs text-primary">
              {nft.serial.number}/{nft.serial.total}
            </Badge>
          )}
          <span className="font-mono text-xs text-text-secondary">ABERTA</span>
        </div>
      </section>

      <section className="hidden items-center justify-between gap-4 md:flex">
        <QuantitySelector
          quantity={quantity}
          max={maxQuantity}
          onDecrement={decrement}
          onIncrement={increment}
        />
        <div className="flex items-center gap-2">
          <Button
            className="h-10 min-w-32 rounded-md bg-primary px-8 font-mono text-sm font-bold text-ink-deep hover:bg-primary-dark"
            disabled={addToCartMutation.isPending || maxQuantity === 0}
            onClick={addToCart}
          >
            COMPRAR
          </Button>
          <NftFavoriteButton
            nftId={nft.id}
            onError={onActionError}
            className="h-10 rounded-md border-primary bg-transparent px-4 font-mono text-sm font-semibold text-primary hover:bg-primary/10 hover:text-primary"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 text-[15px] font-normal md:gap-4 md:font-mono md:text-[15px] md:text-secondary">
        <Metadata label="ID do token" value={`#${nft.id.padStart(4, "0")}`} />
        <Metadata label="Coleção" value={nft.collection} />
        {nft.attributes && <Metadata label="Atributos" value={nft.attributes.join(", ")} />}
      </section>

      <div className="hidden flex-wrap items-center gap-2 text-[15px] font-bold text-white md:flex">
        <span>Compartilhar este NFT:</span>
        <div className="flex items-center gap-2">
          {shareLinks.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target={social.id === "email" ? undefined : "_blank"}
              rel={social.id === "email" ? undefined : "noreferrer"}
              className="flex items-center justify-center border-0 bg-transparent p-0 text-white transition-colors hover:text-primary"
              aria-label={social.label}
            >
              <Icon name={social.id} size={18} />
            </a>
          ))}
        </div>
      </div>

      <div className={floatingPurchaseFooterVariants({ surface: "card", corners: "rounded", elevation: "floating" })}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[15px] font-medium text-text-secondary">Qtd.</span>
            <QuantitySelector
              quantity={quantity}
              max={maxQuantity}
              onDecrement={decrement}
              onIncrement={increment}
            />
          </div>
          <span className="text-right font-mono text-xl font-bold leading-4 text-text-accent">{totalPrice} ETH</span>
        </div>
        <div className="flex items-center justify-start gap-3">
          <Button
            className="h-15 w-49 justify-start rounded-[40px] bg-[linear-gradient(93deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)] px-11 font-mono text-base font-bold leading-5 text-ink hover:bg-primary"
            disabled={addToCartMutation.isPending || maxQuantity === 0}
            onClick={addToCart}
          >
            {addToCartMutation.isPending ? "Adicionando..." : "Comprar NFT"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="size-15 rounded-full border-border bg-surface-raised p-0 text-secondary shadow-none hover:bg-surface-raised"
            aria-label="Adicionar ao carrinho"
            disabled={addToCartMutation.isPending || maxQuantity === 0}
            onClick={addToCart}
          >
            <Icon name="cart-buy" className="size-5" size={20} />
          </Button>
        </div>
        {maxQuantity === 0 && <p className="text-sm text-text-coral">Este NFT está esgotado.</p>}
      </div>
    </div>
  );
}

function Metadata({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-start justify-start gap-1">
      <span className="text-text-secondary md:text-secondary">{label}:</span>
      <span className="text-left text-text-secondary md:text-right md:text-secondary">{value}</span>
    </div>
  );
}

function QuantitySelector({
  quantity,
  max,
  onDecrement,
  onIncrement,
}: {
  readonly quantity: number;
  readonly max: number;
  readonly onDecrement: () => void;
  readonly onIncrement: () => void;
}) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-none border-0 md:h-12.5 md:gap-3 md:rounded-full md:border-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7.5 w-5 rounded-[20px] border border-ink bg-primary px-0 py-0 text-ink shadow-[0_4px_12px_-2px_rgba(20,13,10,0.15)] hover:bg-primary-dark md:h-[49.5px] md:w-8.25 md:rounded-[20px] md:border-0 md:bg-primary md:px-0 md:py-0 md:text-ink-deep md:shadow-none md:hover:bg-primary-dark"
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label="Diminuir quantidade"
      >
        <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      </Button>
      <span className="w-5 text-center font-mono text-lg font-medium text-foreground md:w-8 md:text-xl md:font-normal">{quantity}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7.5 w-5 rounded-[20px] border border-ink bg-primary px-0 py-0 text-ink shadow-[0_4px_12px_-2px_rgba(20,13,10,0.15)] hover:bg-primary-dark md:h-[49.5px] md:w-8.25 md:rounded-[20px] md:border-0 md:px-0 md:py-0 md:text-ink-deep md:shadow-none md:hover:bg-primary-dark"
        onClick={onIncrement}
        disabled={quantity >= max}
        aria-label="Aumentar quantidade"
      >
        <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M8 3v10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      </Button>
    </div>
  );
}

function DesktopRating({ rating }: { readonly rating: { score: number; count: number } }) {
  const fullStars = Math.floor(rating.score);

  return (
    <div className="flex items-center gap-2 font-mono text-sm text-foreground" aria-label={`Avaliação ${rating.score} de 5, ${rating.count} avaliações`}>
      <span className="flex items-center gap-0.5 text-primary" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < fullStars ? "text-primary" : "text-text-secondary"}>
            ★
          </span>
        ))}
      </span>
      <span>{rating.count} avaliações de colecionadores</span>
    </div>
  );
}

function Rating({
  rating,
  className,
}: {
  readonly rating: { score: number; count: number };
  readonly className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-primary px-2 py-1 font-mono text-xs text-foreground ${className ?? ""}`}
      aria-label={`Avaliação ${rating.score.toFixed(1)} de 5, ${rating.count} avaliações`}
    >
      <span className="text-primary" aria-hidden="true">★</span>
      <span>{rating.score.toFixed(1)}</span>
      <span className="text-text-secondary">({rating.count})</span>
    </span>
  );
}
