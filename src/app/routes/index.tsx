import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { listNfts } from '@/infrastructure/http';
import { HeroBanner } from '@/features/banners/components/HeroBanner';
import { CatalogLayout } from '@/features/catalog/layouts/CatalogLayout';
import { CatalogSidebar } from '@/features/catalog/components/CatalogSidebar';
import { CatalogHeader } from '@/features/catalog/components/CatalogHeader';
import { CatalogGrid } from '@/features/catalog/components/CatalogGrid';
import { CatalogPagination } from '@/features/catalog/components/CatalogPagination';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['nfts', { page: 1 }],
    queryFn: ({ signal }) => listNfts({ page: 1 }, signal),
  });

  return (
    <div className="flex flex-col w-full">
      {/* Removemos o HeroBanner do __root e colocamos aqui para respeitar a ordem */}
      <HeroBanner />

      <div className='px-6 py-8 md:py-0 md:px-8 xl:px-0'>
        <CatalogLayout
          sidebar={<CatalogSidebar />}
          header={<CatalogHeader />}
          content={
            isLoading ? (
              <div className="py-20 flex justify-center text-primary font-mono animate-pulse">Carregando NFTs...</div>
            ) : (
              <CatalogGrid items={data?.data || []} />
            )
          }
          pagination={<CatalogPagination />}
        />
      </div>
    </div>
  );
}
