import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      {/* Aqui entrará o Header depois */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4 md:px-8">
          <span className="font-bold text-primary">JungleGaming</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-8 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Jungle Gaming.
          </p>
        </div>
      </footer>

      {/* Devtools visíveis apenas no ambiente de desenvolvimento */}
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </div>
  );
}
