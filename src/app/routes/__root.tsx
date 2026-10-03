import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouterState } from '@tanstack/react-router';
import { Header } from '@/shared/components/Header';
import { HeroBanner } from '@/features/banners/components/HeroBanner';
import { Footer } from '@/shared/components/Footer';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === '/';
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col gap-4 md:gap-8">
      <Header />

      {isHome && <HeroBanner />}

      <main className="flex-1 container mx-auto px-4 md:px-8 py-6 max-w-300">
        <Outlet />
      </main>

      <Footer />

      {/* Devtools visíveis apenas no ambiente de desenvolvimento */}
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </div>
  );
}
