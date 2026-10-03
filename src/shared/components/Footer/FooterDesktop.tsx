import { Link } from "@tanstack/react-router";
import { SocialLinks } from "@/shared/components/SocialLinks";
import { CompatibleWallets } from "@/shared/components/CompatibleWallets";
import { ContactInfo } from "@/shared/components/ContactInfo";
import { Button } from "@/shared/ui/button";

export function FooterDesktop() {
  return (
    <>
      <footer className="w-full bg-surface-card text-foreground font-mono relative z-10 max-w-300 mx-auto">
        {/* Top Features Section */}
        <div className="w-full border-b border-surface-dark">
          <div className="mx-auto p-8 flex divide-x divide-primary">
            <div className="flex flex-[1_1_202px] flex-col gap-4 px-4">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-ink font-bold text-2xl">
                W
              </div>
              <h3 className="font-bold text-[17px]">Segurança da carteira</h3>
              <p className="text-text-secondary text-[14px] leading-relaxed">
                Proteja sua carteira e colecione arte digital verificada com confiança.
              </p>
            </div>

            <div className="flex flex-[1_1_202px] flex-col gap-4 px-4">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-ink font-bold text-2xl">
                C
              </div>
              <h3 className="font-bold text-[17px]">Criadores em destaque</h3>
              <p className="text-text-secondary text-[14px] leading-relaxed">
                Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
              </p>
            </div>

            <div className="flex flex-[1_1_202px] flex-col gap-4 px-4">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-ink font-bold text-2xl">
                D
              </div>
              <h3 className="font-bold text-[17px]">Alertas de lançamentos</h3>
              <p className="text-text-secondary text-[14px] leading-relaxed">
                Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
              </p>
            </div>

            <div className="flex flex-[0_1_357px] flex-col gap-3 px-4">
              <span className="text-[18px] font-bold leading-tight">Antecipe-se ao próximo<br />lançamento</span>
              <div className="flex w-full h-10 items-center justify-between rounded-[6px] bg-surface-dark pl-3 shadow-[0_0_20px_0_rgba(10,6,4,0.45)]">
                <input type="email" placeholder="digite seu e-mail..." className="bg-transparent border-none outline-none text-foreground placeholder:text-secondary text-[14px] w-full h-full" />
                <Button className="h-full rounded-l-none rounded-r-[6px] bg-primary text-ink hover:bg-primary/90 font-bold px-6 text-[14px]">Enviar</Button>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
              </p>
            </div>
          </div>
        </div>

        {/* Middle Bar */}
        <div className="w-full bg-surface-dark">
          <div className="mx-auto px-8 py-6 flex items-center justify-between text-[14px]">
            <span className="font-bold tracking-widest uppercase">KURIO</span>
            <span className="text-foreground leading-relaxed">Feito para colecionadores,<br />criadores e cultura</span>
            <ContactInfo asWrapper={false} />
          </div>
        </div>

        {/* Main Footer Section */}
        <div className="w-full border-b border-surface-dark">
          <div className="mx-auto px-8 py-16 grid grid-cols-4 gap-8">
            {/* Links Columns */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-[18px]">Meu perfil</h4>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Meu perfil</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Minha coleção</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Atividade</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Estúdio do criador</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Lista de interesse</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-[18px]">Central de ajuda</h4>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Central de ajuda</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Como comprar NFTs</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Carteira e segurança</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Política do mercado</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Denunciar item</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-[18px]z">Coleções</h4>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Arte digital</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Fotografia</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Música</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Arte 3D</Link>
              <Link to="/" className="text-foreground text-[14px] hover:text-primary transition-colors">Utilidade</Link>
            </div>

            {/* Socials & Wallets */}
            <div className="flex flex-col gap-10">
              <SocialLinks variant="desktop" />
              <CompatibleWallets variant="desktop" />
            </div>
          </div>
        </div>

      </footer>
      <div className="w-full">
        <div className="mx-auto px-8 py-6 flex justify-center items-center text-[14px] text-foreground">
          <p>© 2026 Kurio. Propriedade digital para todos.</p>
        </div>
      </div>
    </>
  );
}
