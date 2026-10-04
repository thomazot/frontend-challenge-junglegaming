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
import { Icon } from "@/shared/components/Icon";

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
      className="w-full px-4 md:px-0"
    >
      <div className="max-w-300 mx-auto px-6 py-8 md:py-0 md:px-8 xl:px-0 relative overflow-hidden rounded-3xl md:rounded-none bg-[linear-gradient(105deg,rgba(210,138,76,0.20)_1.08%,rgba(210,138,76,0.10)_99.23%)] md:bg-transparent! md:bg-none!">

        {/* Círculos decorativos do fundo (apenas mobile) */}
        <div className="absolute inset-0 pointer-events-none md:hidden overflow-hidden rounded-3xl">
          {/* Bolha 1: 100% do container (w-full), 40% para fora da esquerda (-left-[40%]) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-72 h-72 rounded-full -left-28"
            style={{ background: 'linear-gradient(160deg, rgba(221, 154, 95, 0.43) 22.1%, rgba(210, 138, 76, 0.04) 87.42%)' }}
          ></div>

          {/* Bolha 2: 100% do container (w-full), sobrepondo 40% (left-[20%]) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-72 h-72 rounded-full left-14"
            style={{ background: 'linear-gradient(160deg, rgba(221, 154, 95, 0.37) 22.1%, rgba(210, 138, 76, 0.00) 87.42%)' }}
          ></div>
        </div>

        <Carousel setApi={setApi} plugins={[autoplay.current]} className="w-full relative z-10" onMouseEnter={autoplay.current.stop} onMouseLeave={autoplay.current.reset}>
          <CarouselContent>
            {/* Slide 1 */}
            <CarouselItem>
              <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12 w-full relative">

                {/* Text Content */}
                <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full md:max-w-xl pr-36 md:pr-0">
                  <span className="font-mono text-xs md:text-sm font-medium md:font-normal text-foreground md:text-text-secondary">
                    Bem-vindo à Kurio
                  </span>

                  <h1 className="font-mono text-lg md:text-5xl font-bold uppercase leading-7 md:leading-tight text-foreground">
                    SEJA DONO DA<br className="hidden md:block" />
                    <span className="md:hidden"> CULTURA DIGITAL</span>
                    <span className="hidden md:block"> ARTE DIGITAL</span>
                  </h1>

                  <p className="font-mono text-text-secondary text-xs md:text-sm font-normal leading-snug md:leading-6">
                    Descubra NFTs selecionados de criadores <span className="md:hidden">do mundo todo.</span><span className="hidden md:inline">emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</span>
                  </p>

                  <div className="mt-2 md:mt-0">
                    {/* Botão Desktop */}
                    <Button
                      className="hidden md:flex bg-primary hover:bg-primary-dark text-ink-deep font-bold rounded-lg w-36 h-10 py-2.5 pr-9 pl-7 justify-center items-center gap-2.5"
                    >
                      EXPLORAR
                    </Button>

                    {/* Link Mobile */}
                    <button className="flex md:hidden items-center gap-2 text-text-accent font-mono text-xs font-bold leading-none uppercase tracking-wider">
                      EXPLORAR <Icon name="arrow-right" />
                    </button>
                    <div className="hidden md:flex items-center gap-2 justify-end pt-11" aria-label="Controles do carrossel">
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          aria-label={`Ir para o slide ${index + 1}`}
                          aria-current={current === index}
                          onClick={() => api?.scrollTo(index)}
                          className="size-6 flex items-center justify-center cursor-pointer">
                          <span className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            current === index ? "bg-primary" : "bg-primary opacity-40 hover:opacity-70"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image Content */}
                <div className="w-full md:flex-1 flex justify-end absolute md:relative right-0 top-0 md:top-auto">
                  <img
                    src="/images/monkey-nft.jpg"
                    srcSet="/images/monkey-nft-144.webp 144w, /images/monkey-nft-384.webp 384w, /images/monkey-nft.jpg 504w"
                    sizes="(max-width: 767px) 144px, 504px"
                    alt="Avatar NFT 3D de um macaco"
                    fetchPriority="high"
                    className="w-36 h-36 md:w-full md:h-auto aspect-square object-cover rounded-3xl md:rounded-3xl shadow-lg md:max-w-lg z-10"
                  />
                </div>
              </div>
            </CarouselItem>

            {/* Slide 2 */}
            <CarouselItem>
              <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12 w-full relative">
                <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full md:max-w-xl pr-36 md:pr-0">
                  <span className="font-mono text-xs md:text-sm font-medium md:font-normal text-foreground md:text-text-secondary">
                    Exclusividade Garantida
                  </span>
                  <h2 className="font-mono text-lg md:text-5xl font-bold uppercase leading-7 md:leading-tight text-foreground">
                    COLEÇÕES INÉDITAS<br />
                    TODAS AS SEMANAS
                  </h2>
                  <p className="font-mono text-text-secondary text-xs md:text-sm font-normal leading-snug md:leading-6">
                    Participe de drops exclusivos <span className="hidden md:inline">e tenha acesso a artes limitadas antes de todo mundo.</span>
                  </p>
                  <div className="mt-2 md:mt-0">
                    <Button className="hidden md:flex bg-primary hover:bg-primary-dark text-ink-deep font-bold rounded-lg w-36 h-10 py-2.5 pr-9 pl-7 justify-center items-center gap-2.5">
                      VER DROPS
                    </Button>
                    <button className="flex md:hidden items-center gap-2 text-text-accent font-mono text-xs font-bold leading-none uppercase tracking-wider">
                      VER DROPS <Icon name="arrow-right" />
                    </button>
                    <div className="hidden md:flex items-center gap-2 justify-end pt-11" aria-label="Controles do carrossel">
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          aria-label={`Ir para o slide ${index + 1}`}
                          aria-current={current === index}
                          onClick={() => api?.scrollTo(index)}
                          className="size-6 flex items-center justify-center cursor-pointer">
                          <span className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            current === index ? "bg-primary" : "bg-primary opacity-40 hover:opacity-70"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full md:flex-1 flex justify-end absolute md:relative right-0 top-0 md:top-auto">
                  <div className="w-36 h-36 md:w-full md:h-auto aspect-square rounded-3xl md:rounded-3xl shadow-lg bg-surface-dark flex items-center justify-center border border-border md:max-w-lg z-10">
                    <span className="text-muted-foreground font-mono text-xs md:text-base text-center px-2">Em breve</span>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 3 */}
            <CarouselItem>
              <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12 w-full relative">
                <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full md:max-w-xl pr-36 md:pr-0">
                  <span className="font-mono text-xs md:text-sm font-medium md:font-normal text-foreground md:text-text-secondary">
                    Comunidade Kurio
                  </span>
                  <h2 className="font-mono text-lg md:text-5xl font-bold uppercase leading-7 md:leading-tight text-foreground">
                    CONECTE-SE COM<br />
                    OUTROS CRIADORES
                  </h2>
                  <p className="font-mono text-text-secondary text-xs md:text-sm font-normal leading-snug md:leading-6">
                    Faça parte de uma comunidade global apaixonada por arte digital e web3.
                  </p>
                  <div className="mt-2 md:mt-0">
                    <Button className="hidden md:flex bg-primary hover:bg-primary-dark text-ink-deep font-bold rounded-lg w-36 h-10 py-2.5 pr-9 pl-7 justify-center items-center gap-2.5">
                      PARTICIPAR
                    </Button>
                    <button className="flex md:hidden items-center gap-2 text-text-accent font-mono text-xs font-bold leading-none uppercase tracking-wider">
                      PARTICIPAR <Icon name="arrow-right" />
                    </button>
                    <div className="hidden md:flex items-center gap-2 justify-end pt-11" aria-label="Controles do carrossel">
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          aria-label={`Ir para o slide ${index + 1}`}
                          aria-current={current === index}
                          onClick={() => api?.scrollTo(index)}
                          className="size-6 flex items-center justify-center cursor-pointer">
                          <span className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            current === index ? "bg-primary" : "bg-primary opacity-40 hover:opacity-70"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full md:flex-1 flex justify-end absolute md:relative right-0 top-0 md:top-auto">
                  <div className="w-36 h-36 md:w-full md:h-auto aspect-square rounded-3xl md:rounded-3xl shadow-lg bg-surface-dark flex items-center justify-center border border-border md:max-w-lg z-10">
                    <span className="text-muted-foreground font-mono text-xs md:text-base text-center px-2">Em breve</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>

          {/* Dots Indicator */}
          <div className="absolute md:hidden flex justify-center w-full bottom-4">
            <div className="flex items-center gap-4" aria-label="Controles do carrossel">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  aria-label={`Ir para o slide ${index + 1}`}
                  aria-current={current === index}
                  onClick={() => api?.scrollTo(index)}
                  className="size-6 flex items-center justify-center cursor-pointer">
                  <span className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    current === index ? "bg-primary" : "bg-primary opacity-40 hover:opacity-70"
                  )} />
                </button>
              ))}
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
