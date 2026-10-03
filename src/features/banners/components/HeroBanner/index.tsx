import { Button } from "@/shared/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/carousel";
import { type CarouselApi } from "@/shared/ui/carousel";
import { useState, useEffect, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "cn";

export function HeroBanner() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section 
      aria-label="Banner Principal"
      className="w-full"
    >
      <div className="max-w-300 mx-auto">
        <Carousel setApi={setApi} plugins={[autoplay.current]} className="w-full relative" onMouseEnter={autoplay.current.stop} onMouseLeave={autoplay.current.reset}>
          <CarouselContent>
            {/* Slide 1 */}
            <CarouselItem>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 w-full">
                {/* Text Content */}
                <div className="flex-1 flex flex-col gap-6 md:max-w-xl">
                  <span className="font-mono text-sm text-foreground md:text-text-secondary">
                    Bem-vindo à Kurio
                  </span>
                  
                  <h1 className="font-mono text-5xl font-bold uppercase leading-tight text-foreground">
                    SEJA DONO DO FUTURO<br />
                    DA ARTE DIGITAL
                  </h1>
                  
                  <p className="font-mono text-text-secondary text-sm font-normal leading-6">
                    Descubra NFTs selecionados de criadores emergentes e consagrados. 
                    Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
                  </p>
                  
                  <div>
                    <Button 
                      className="bg-primary hover:bg-primary-dark text-ink-deep font-bold rounded-lg flex w-36 h-10 py-2.5 pr-9 pl-7 justify-center items-center gap-2.5"
                    >
                      EXPLORAR
                    </Button>
                  </div>
                </div>

                {/* Image Content */}
                <div className="flex-1 w-full flex justify-end">
                  <img 
                    src="/images/monkey-nft.jpg" 
                    alt="Avatar NFT 3D de um macaco usando jaqueta e óculos escuros" 
                    // @ts-ignore: React 18 type missing fetchpriority
                    fetchPriority="high"
                    className="w-full max-w-lg aspect-square object-cover rounded-3xl shadow-2xl" 
                  />
                </div>
              </div>
            </CarouselItem>

            {/* Slide 2 (Placeholder duplicate to show carousel working) */}
            <CarouselItem>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 w-full">
                <div className="flex-1 flex flex-col gap-6 md:max-w-xl">
                  <span className="font-mono text-sm text-foreground md:text-text-secondary">
                    Exclusividade Garantida
                  </span>
                  <h2 className="font-mono text-5xl font-bold uppercase leading-tight text-foreground">
                    COLEÇÕES INÉDITAS<br />
                    TODAS AS SEMANAS
                  </h2>
                  <p className="font-mono text-text-secondary text-sm font-normal leading-6">
                    Participe de drops exclusivos e tenha acesso a artes limitadas antes de todo mundo.
                  </p>
                  <div>
                    <Button className="bg-primary hover:bg-primary-dark text-ink-deep font-bold rounded-lg flex w-36 h-10 py-2.5 pr-9 pl-7 justify-center items-center gap-2.5">
                      VER DROPS
                    </Button>
                  </div>
                </div>
                <div className="flex-1 w-full flex justify-end">
                  <div className="w-full max-w-lg aspect-square rounded-3xl shadow-2xl bg-surface-dark flex items-center justify-center border border-border">
                    <span className="text-muted-foreground font-mono">Mais artes em breve</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
            
            {/* Slide 3 */}
            <CarouselItem>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 w-full">
                <div className="flex-1 flex flex-col gap-6 md:max-w-xl">
                  <span className="font-mono text-sm text-foreground md:text-text-secondary">
                    Comunidade Kurio
                  </span>
                  <h2 className="font-mono text-5xl font-bold uppercase leading-tight text-foreground">
                    CONECTE-SE COM<br />
                    OUTROS CRIADORES
                  </h2>
                  <p className="font-mono text-text-secondary text-sm font-normal leading-6">
                    Faça parte de uma comunidade global apaixonada por arte digital e web3.
                  </p>
                  <div>
                    <Button className="bg-primary hover:bg-primary-dark text-ink-deep font-bold rounded-lg flex w-36 h-10 py-2.5 pr-9 pl-7 justify-center items-center gap-2.5">
                      PARTICIPAR
                    </Button>
                  </div>
                </div>
                <div className="flex-1 w-full flex justify-end">
                  <div className="w-full max-w-lg aspect-square rounded-3xl shadow-2xl bg-surface-dark flex items-center justify-center border border-border">
                    <span className="text-muted-foreground font-mono">Mais artes em breve</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>

          
          {/* Dots Indicator */}
          <div className="absolute md:left-0 md:bottom-0 md:w-[36rem] flex justify-end w-full mt-6 md:mt-0 pb-2">
            <div className="flex items-center gap-2" aria-label="Controles do carrossel">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  aria-label={`Ir para o slide ${index + 1}`}
                  aria-current={current === index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    current === index ? "bg-primary" : "bg-primary opacity-40 hover:opacity-70"
                  )}
                />
              ))}
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
