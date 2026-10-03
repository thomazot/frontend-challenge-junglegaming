import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Buy, Logout, Filter } from "react-iconly";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";

export function Header() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Início" },
    { to: "/mercado", label: "Mercado" },
    { to: "/criadores", label: "Criadores" },
    { to: "/aprenda", label: "Aprenda" },
  ];

  return (
    <header className="max-w-300 sticky top-0 z-50 w-full border-b border-border bg-background mx-auto">
      {/* --- DESKTOP HEADER --- */}
      <div className="mx-auto hidden md:flex h-20 items-center justify-between px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl tracking-widest text-foreground uppercase font-mono">
            KURIO
          </span>
        </Link>

        {/* Navigation Centered */}
        <nav className="flex h-full items-center gap-10">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex h-full items-center px-1 text-base font-medium transition-colors font-mono ${isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-underline"
                    className="absolute bottom-0 left-0 h-0.75 w-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-7">
          <Button variant="ghostPrimary" size="icon">
            <Search set="curved" primaryColor="currentColor" size={24} />
            <span className="sr-only">Buscar</span>
          </Button>

          <Button variant="ghostPrimary" size="icon" className="relative">
            <Buy set="curved" primaryColor="currentColor" size={24} />
            <Badge
              className="absolute 0 -right-2 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground border-transparent"
            >
              6
            </Badge>
            <span className="sr-only">Carrinho</span>
          </Button>

          <Button className="ml-2 px-6">
            <Logout set="curved" primaryColor="currentColor" size={24} />
            <span>Entrar</span>
          </Button>
        </div>
      </div>

      {/* --- MOBILE HEADER --- */}
      <div className="flex md:hidden mx-auto h-20 items-center px-4 gap-3">
        <div className="flex flex-1 items-center gap-3 bg-card rounded-[10px] px-4 h-11.25 text-muted-foreground">
          <Search set="curved" primaryColor="currentColor" size={24} />
          <Input
            type="search"
            placeholder="Explorar coleções"
            className="border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 font-mono shadow-none h-full text-sm font-bold"
          />
        </div>

        <Button variant="gradient" size="mobileIcon">
          <Filter set="curved" primaryColor="currentColor" size={24} />
          <span className="sr-only">Filtros</span>
        </Button>
      </div>
    </header>
  );
}
