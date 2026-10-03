import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";

export function CatalogPagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  const handlePageChange = (page: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Pagination className="justify-end w-auto mx-0">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-label="Página anterior"
              onClick={(e) => handlePageChange(currentPage - 1, e)}
            />
          </PaginationItem>
        )}

        {[1, 2, 3, 4].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={currentPage === page}
              onClick={(e) => handlePageChange(page, e)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-label="Próxima página"
              onClick={(e) => handlePageChange(currentPage + 1, e)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
