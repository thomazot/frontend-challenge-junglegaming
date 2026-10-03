import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";

interface CatalogPaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handlePageChange = (target: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (target >= 1 && target <= totalPages) onPageChange(target);
  };

  return (
    <Pagination className="justify-end w-auto mx-0">
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href="#" aria-label="Página anterior" onClick={(e) => handlePageChange(page - 1, e)} />
          </PaginationItem>
        )}

        {pages.map((target) => (
          <PaginationItem key={target}>
            <PaginationLink href="#" isActive={page === target} onClick={(e) => handlePageChange(target, e)}>
              {target}
            </PaginationLink>
          </PaginationItem>
        ))}

        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href="#" aria-label="Próxima página" onClick={(e) => handlePageChange(page + 1, e)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
