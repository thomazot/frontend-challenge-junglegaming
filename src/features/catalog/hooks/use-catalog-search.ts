import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

/**
 * Binds a search input to the `q` search param of the catalog route.
 * Navigation is debounced; external URL changes (back/forward, links) sync the input back.
 * Safe to use outside the catalog route (returns empty value when not on catalog).
 */
export function useCatalogSearch() {
  const navigate = useNavigate();
  const location = useLocation({
    select: (location) => ({ pathname: location.pathname, search: location.search }),
  });
  const { pathname, search: routeSearch } = location;
  const isCatalog = pathname === "/";
  const queryFromRoute = typeof routeSearch.q === "string" ? routeSearch.q : "";

  // Parse q from URL directly to avoid useSearch() hook which requires active route match
  const getQFromUrl = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("q") ?? "";
  };

  const [value, setValue] = useState(getQFromUrl);
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
    setValue(queryFromRoute);
  }, [pathname, queryFromRoute]); // Re-sync when route or search changes

  useEffect(() => {
    if (!isTypingRef.current) return;
    const q = debounced.trim();
    if (isCatalog && q === getQFromUrl()) {
      isTypingRef.current = false;
      return;
    }
    isTypingRef.current = false;
    navigate({
      to: "/",
      // New search term restarts pagination.
      search: (prev: Record<string, unknown>) => ({ ...prev, q: q || undefined, page: undefined }),
      replace: true,
      resetScroll: false,
    });
  }, [debounced, isCatalog, navigate]);

  return { value, setValue: setInputValue };
}
