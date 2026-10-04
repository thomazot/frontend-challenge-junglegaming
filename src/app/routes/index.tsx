import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listNfts } from '@/infrastructure/http';
import { nftListParamsSchema } from '@/shared/api/schemas';
import { HeroBanner } from '@/features/banners/components/HeroBanner';
import { CatalogLayout } from '@/features/catalog/layouts/CatalogLayout';
import { CatalogSidebar, CatalogSidebarSkeleton } from '@/features/catalog/components/CatalogSidebar';
import { CatalogHeader } from '@/features/catalog/components/CatalogHeader';
import { CatalogGrid, CatalogGridSkeleton } from '@/features/catalog/components/CatalogGrid';
import { CatalogPagination } from '@/features/catalog/components/CatalogPagination';

export const Route = createFileRoute('/')({
  // URL is the single source of truth for catalog state (survives refresh/history).
  validateSearch: (search) => nftListParamsSchema.parse(search),
  component: HomePage,
});

function HomePage() {
  const params = Route.useSearch();
  const navigate = useNavigate({ from: '/' });
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['nfts', params],
    queryFn: ({ signal }) => listNfts(params, signal),
    // Keep the previous grid while the next page/filter loads (no layout jump).
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex flex-col w-full">
      {/* Removemos o HeroBanner do __root e colocamos aqui para respeitar a ordem */}
      <HeroBanner />

      <div className='px-6 py-8 md:py-0 md:px-8 xl:px-0'>
        <CatalogLayout
          sidebar={isPending || !data ? <CatalogSidebarSkeleton /> : <CatalogSidebar facets={data.facets} />}
          header={<CatalogHeader sort={params.sort} />}
          content={renderContent()}
          pagination={
            data && data.meta.totalPages > 1 ? (
              <CatalogPagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={(page) =>
                  navigate({ search: (prev) => ({ ...prev, page }), replace: true, resetScroll: false })
                }
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );

  function renderContent() {
    if (isPending || !data) return <CatalogGridSkeleton />;
    if (isError) {
      return (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">Não foi possível carregar o catálogo.</p>
          <button onClick={() => refetch()} className="font-mono text-primary underline">
            Tentar novamente
          </button>
        </div>
      );
    }
    return <CatalogGrid items={data.data} />;
  }
}
