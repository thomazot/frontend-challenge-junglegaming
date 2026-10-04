import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getNft } from '@/infrastructure/http';
import { NftDetail } from '@/features/nfts/components/NftDetail';
import { NftDetailSkeleton } from '@/features/nfts/components/NftDetail/NftDetailSkeleton';
import { Button } from '@/shared/ui/button';

export const Route = createFileRoute('/nft/$nftSlug')({
  component: NftPage,
});

function NftPage() {
  const { nftSlug } = Route.useParams();
  const { data: nft, isPending, isError, refetch } = useQuery({
    queryKey: ['nft', nftSlug],
    queryFn: ({ signal }) => getNft(nftSlug, signal),
  });

  if (isPending) return <NftDetailSkeleton />;

  if (isError || !nft) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">NFT não encontrado.</p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  return <NftDetail nft={nft} />;
}
