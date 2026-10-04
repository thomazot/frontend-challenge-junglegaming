import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';
import { MockControlPanel } from '@/infrastructure/mocks/MockControlPanel';
import { cn } from '@/shared/utils/utils';
import { useRealtimeSync } from '@/app/hooks/use-realtime-sync';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useRealtimeSync();
  const isNftDetail = useRouterState({
    select: ({ location }) => location.pathname.startsWith('/nft/'),
  });

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col bg-background font-sans text-foreground antialiased md:gap-8',
        isNftDetail ? 'gap-0 bg-surface-raised md:bg-background' : 'gap-4',
      )}
    >
      <div className={cn(isNftDetail && 'hidden md:block')}>
        <Header />
      </div>

      <main
        className={cn(
          'container mx-auto flex-1',
          isNftDetail ? 'max-w-full pb-0 md:max-w-300 px-4 xl:px-0' : 'max-w-300 pb-37.5 md:pb-6',
        )}
      >
        <Outlet />
      </main>

      <div className={cn(isNftDetail && 'hidden md:block')}>
        <Footer />
      </div>

      {/* Devtools visíveis apenas no ambiente de desenvolvimento */}
      {import.meta.env.DEV && !isNftDetail && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <MockControlPanel />
        </>
      )}
    </div>
  );
}
