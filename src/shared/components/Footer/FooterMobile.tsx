import { Link } from "@tanstack/react-router";
import { HeaderCategories } from "@/features/categories/components/HeaderCategories";
import { Icon } from "@/shared/components/Icon";

export function FooterMobile() {
  return (
    <footer className="fixed bottom-0 left-0 w-screen z-50 pb-0">
      <div className="relative w-full h-23.75">

        {/* Flawless SVG Background Layer from Figma */}
        <div
          className="absolute inset-0 flex z-0"
          style={{ filter: 'drop-shadow(0 -10px 30px rgba(10, 6, 4, 0.45))' }}
        >
          {/* Left Side */}
          <div className="flex-1 bg-surface-card rounded-tl-3xl translate-x-1 z-10"></div>

          {/* Center SVG Notch — original size to create the curve for the floating button */}
          <div className="shrink-0 z-0 w-37.925 h-23.75 text-surface-card [&>svg]:w-full [&>svg]:h-full">
            <Icon name="footer-notch" size="100%" />
          </div>

          {/* Right Side */}
          <div className="flex-1 bg-surface-card rounded-tr-3xl -translate-x-1 z-10"></div>
        </div>

        {/* Icons Layer */}
        <div className="absolute inset-0 flex z-10">
          {/* Left Icons */}
          <div className="flex flex-1 items-center justify-evenly pr-6 pl-2">
            <Link to="/" className="p-1.5 text-secondary hover:text-primary transition-colors flex items-center justify-center" aria-label="Home">
              <Icon name="home" set="bold" size={20} />
            </Link>
            <Link to="/" className="p-1.5 text-primary hover:text-primary transition-colors flex items-center justify-center" aria-label="Favoritos">
              <Icon name="heart" set="bold" size={20} />
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex flex-1 items-center justify-evenly pl-6 pr-2">
            <Link to="/" className="p-1.5 text-secondary hover:text-primary transition-colors flex items-center justify-center" aria-label="Carrinho">
              <Icon name="cart-solid" className="size-5" />
            </Link>
            <Link to="/" className="p-1.5 text-secondary hover:text-primary transition-colors flex items-center justify-center" aria-label="Carrinho">
              <Icon name="user" set="bold" size={20} />
            </Link>
          </div>
        </div>

        {/* Center Floating Action Button (O Círculo Central) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 flex items-center justify-center w-16.25 h-16.25 z-20 cursor-pointer">

          <HeaderCategories>
            <button aria-label="Abrir Menu de Categorias" className="appearance-none bg-transparent border-none outline-none relative w-full h-full flex items-center justify-center cursor-pointer">
              {/* O Círculo de Fundo (com o gradiente e a opacidade) */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(180deg, rgba(210, 138, 76, 0.40) -16.92%, #D28A4C 109.23%)' }}
              ></div>

              {/* O Ícone Interno (agora com primaryColor="white" pra ficar branco) */}
              <div className="relative z-10 text-white">
                <Icon name="jungle-logo" />
              </div>
            </button>
          </HeaderCategories>

        </div>

      </div>
    </footer>
  );
}
