import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useSlidingIndicator } from "@/shared/hooks/useSlidingIndicator";

const tabTriggerClassName =
  "group relative h-auto flex-none rounded-none border-0 bg-transparent px-0 py-3 font-mono text-[17px] leading-4 font-normal text-foreground shadow-none transition-colors after:hidden hover:text-foreground focus-visible:ring-0 data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-text-accent";

interface NftTabsProps {
  readonly description: string;
}

export function NftTabs({ description }: NftTabsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { containerRef, indicatorStyle } = useSlidingIndicator(activeTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList ref={containerRef} variant="line" className="relative h-auto w-full justify-start gap-8 rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger value="details" data-sliding-item="details" className={tabTriggerClassName}>
          Detalhes do NFT
        </TabsTrigger>
        <TabsTrigger value="reviews" data-sliding-item="reviews" className={tabTriggerClassName}>
          Avaliações de colecionadores (19)
        </TabsTrigger>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 bg-text-accent transition-[transform,width] duration-300 ease-in-out motion-reduce:transition-none"
          style={indicatorStyle}
        />
      </TabsList>

      <TabsContent value="details" className="pt-6">
        <div className="flex flex-col gap-4 font-mono text-sm text-muted-foreground leading-relaxed max-w-3xl">
          <p>{description}</p>
          <p>
            A procedência inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro
            permanente de procedência registrada na rede. Nova Sato recebe 5% de direitos autorais nas vendas
            secundárias, apoiando novos trabalhos e lançamentos da comunidade.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-bold text-foreground mb-1">Rede:</h4>
              <p>Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.</p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Contrato:</h4>
              <p>Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Direitos autorais:</h4>
              <p>0x7A42...19E8 · Contrato inteligente ERC-721 verificado.</p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="pt-6">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">Colecionador {i + 1}</span>
                  <div className="flex text-primary">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s}>★</span>
                    ))}
                  </div>
                </div>
                <p className="font-mono text-sm text-muted-foreground">
                  Excelente aquisição! A arte é ainda mais impressionante pessoalmente.
                </p>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
