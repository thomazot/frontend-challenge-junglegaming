import { lazy, Suspense, useEffect, useState } from 'react';
import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MockControlPanel } from '@/infrastructure/mocks/MockControlPanel';
import { cn } from '@/shared/utils/utils';
import { useRealtimeSync } from '@/app/hooks/use-realtime-sync';

const Header = lazy(() => import('@/shared/components/Header').then((module) => ({ default: module.Header })));
const Footer = lazy(() => import('@/shared/components/Footer').then((module) => ({ default: module.Footer })));

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useRealtimeSync();
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const isNftDetail = useRouterState({
    select: ({ location }) => location.pathname.startsWith('/nft/'),
  });

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const updateIsDesktop = () => setIsDesktop(media.matches);
    media.addEventListener('change', updateIsDesktop);
    return () => media.removeEventListener('change', updateIsDesktop);
  }, []);

  const showSiteChrome = !isNftDetail || isDesktop;

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col bg-background font-sans text-foreground antialiased md:gap-8',
        isNftDetail ? 'gap-0 bg-surface-raised md:bg-background' : 'gap-4',
      )}
    >
      {showSiteChrome && (
        <div className={cn(isNftDetail && 'hidden md:block')}>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
        </div>
      )}

      <main
        className={cn(
          'container mx-auto flex-1',
          isNftDetail ? 'max-w-full pb-0 md:max-w-300 px-4 xl:px-0' : 'max-w-300 pb-37.5 md:pb-6',
        )}
      >
        <Outlet />
      </main>

      {showSiteChrome && (
        <div className={cn(isNftDetail && 'hidden md:block')}>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      )}

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
