import { Skeleton } from "@/shared/ui/skeleton";

export function NftDetailSkeleton() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-360 flex-col gap-16 overflow-hidden rounded-[40px] bg-ink px-4 py-4 md:min-h-0 md:gap-24 md:overflow-visible md:rounded-none md:bg-transparent md:px-8 md:py-6 lg:px-30">
      {/* Breadcrumb */}
      <Skeleton className="hidden h-4 w-32 md:block" />

      <div className="grid grid-cols-1 items-start gap-0 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        {/* Gallery */}
        <div className="flex min-w-0 flex-col gap-4 md:flex-row">
          <div className="order-2 hidden gap-2 md:order-1 md:flex md:flex-col">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-16 rounded-md" />
            ))}
          </div>
          <Skeleton className="aspect-square min-w-0 flex-1 rounded-md order-1 md:order-2" />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col gap-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="hidden h-64 w-full lg:block" />

      {/* Related */}
      <Skeleton className="hidden h-80 w-full lg:block" />
    </div>
  );
}
