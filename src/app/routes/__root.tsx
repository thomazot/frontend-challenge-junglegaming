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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col gap-4 md:gap-8">
      <Header />



      <main className="flex-1 container mx-auto pb-37.5 md:pb-6 max-w-300">
        <Outlet />
      </main>

      <Footer />

      {/* Devtools visíveis apenas no ambiente de desenvolvimento */}
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </>
      )}
    </div>
  );
}
