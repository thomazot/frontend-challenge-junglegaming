import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Route } from "@/app/routes";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

/**
 * Binds a search input to the `q` search param of the catalog route.
 * Navigation is debounced; external URL changes (back/forward, links) sync the input back.
 */
export function useCatalogSearch() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const isCatalog = pathname === "/";

  const [value, setValue] = useState(search.q ?? "");
  const debounced = useDebouncedValue(value, 400);
  /** True when the current debounced value came from typing (not from URL sync). */
  const isTypingRef = useRef(false);

  const setInputValue = (next: string) => {
    isTypingRef.current = true;
    setValue(next);
  };

  useEffect(() => {
    // URL changed externally (back/forward): sync the input without re-navigating.
    isTypingRef.current = false;
    setValue(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    if (!isCatalog || !isTypingRef.current) return;
    const q = debounced.trim();
    if (q === (search.q ?? "")) return;
    isTypingRef.current = false;
    navigate({
      to: "/",
      // New search term restarts pagination.
      search: (prev: Record<string, unknown>) => ({ ...prev, q: q || undefined, page: undefined }),
      replace: true,
    });
  }, [debounced, isCatalog, search.q, navigate]);

  return { value, setValue: setInputValue };
}
