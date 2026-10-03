import { Skeleton } from "@/shared/ui/skeleton";

export function CatalogGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex flex-col gap-2 px-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
