import { Skeleton } from "@/shared/ui/skeleton";

export function CatalogSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-10 bg-card p-6">
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-col gap-0 pl-3">
            {Array.from({ length: section === 0 ? 9 : 3 }).map((_, row) => (
              <div key={row} className="flex h-10 items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
