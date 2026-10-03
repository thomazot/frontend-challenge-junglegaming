import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-6 max-w-300 mx-auto">
        <Outlet />
      </main>

      <Footer />

      {/* Devtools visíveis apenas no ambiente de desenvolvimento */}
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </div>
  );
}
