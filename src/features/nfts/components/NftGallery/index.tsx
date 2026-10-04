import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Icon } from "@/shared/components/Icon";

interface NftGalleryProps {
  readonly images: { readonly id: string; readonly src: string }[];
  readonly name: string;
}

export function NftGallery({ images, name }: NftGalleryProps) {
  const [selectedImageId, setSelectedImageId] = useState(images[0]?.id);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const currentImage = images.find((image) => image.id === selectedImageId) ?? images[0];
  const currentImageIndex = images.findIndex((image) => image.id === currentImage?.id);

  const selectImage = (index: number) => {
    const image = images[(index + images.length) % images.length];
    if (image) setSelectedImageId(image.id);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") selectImage(currentImageIndex - 1);
      if (event.key === "ArrowRight") selectImage(currentImageIndex + 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentImageIndex, images, isLightboxOpen]);

  if (!currentImage) return null;

  return (
    <div className="flex min-w-0 flex-col gap-4 md:flex-row md:gap-4">
      <div className="order-2 hidden shrink-0 gap-3 md:order-1 md:flex md:flex-col">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedImageId(image.id)}
            className={cn(
              "size-16 overflow-hidden rounded-xl border-2 bg-surface-card transition-colors",
              currentImage.id === image.id ? "border-primary" : "border-transparent hover:border-border-soft",
            )}
            aria-label={`Ver imagem ${index + 1} de ${name}`}
            aria-pressed={currentImage.id === image.id}
          >
            <img src={image.src} alt="" className="size-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      <div className="order-1 min-w-0 flex-1 md:order-2">
        <div className="relative aspect-[1.18/1] overflow-hidden rounded-2xl bg-surface-card md:aspect-square md:p-4">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute inset-0 size-full cursor-zoom-in p-0 md:p-4"
            aria-label={`Ampliar imagem de ${name}`}
          >
            <img
              src={currentImage.src}
              alt={name}
              className="size-full rounded-xl object-cover"
              loading="eager"
            />
            <span className="pointer-events-none absolute right-3 top-3 hidden size-10 items-center justify-center rounded-full bg-surface-raised text-white md:flex">
              <Icon name="search" className="size-5" />
            </span>
          </button>
        </div>
      </div>

      <DialogPrimitive.Root open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-4 z-50 flex flex-col gap-4 overflow-auto rounded-2xl border border-border bg-surface-card p-4 text-foreground shadow-2xl outline-none duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 md:inset-8 md:flex-row md:gap-6 md:p-6"
          >
            <DialogPrimitive.Title className="sr-only">{name} - visualizador de imagens</DialogPrimitive.Title>

            <DialogPrimitive.Close
              className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-surface-raised text-foreground transition-colors hover:bg-border-soft"
              aria-label="Fechar visualizador"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>

            <div className="order-2 flex shrink-0 gap-2 overflow-x-auto md:order-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImageId(image.id)}
                  className={cn(
                    "size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-surface-raised transition-colors",
                    currentImage.id === image.id ? "border-primary" : "border-transparent hover:border-border-soft",
                  )}
                  aria-label={`Ver imagem ${index + 1} de ${name}`}
                  aria-pressed={currentImage.id === image.id}
                >
                  <img src={image.src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>

            <div className="relative order-1 flex min-h-0 min-w-0 flex-1 items-center justify-center md:order-2">
              <img
                src={currentImage.src}
                alt={name}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => selectImage(currentImageIndex - 1)}
                    className="absolute left-2 flex size-11 items-center justify-center rounded-full bg-surface-raised text-foreground transition-colors hover:bg-border-soft md:left-4"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectImage(currentImageIndex + 1)}
                    className="absolute right-2 flex size-11 items-center justify-center rounded-full bg-surface-raised text-foreground transition-colors hover:bg-border-soft md:right-4"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
