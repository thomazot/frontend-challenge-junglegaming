import { useRef, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cva } from "class-variance-authority";
import { Icon } from "@/shared/components/Icon";
import { useCatalogSearch } from "@/features/catalog/hooks/use-catalog-search";
import { X } from "lucide-react";

const headerSearchVariants = {
  container: cva(
    "flex items-center transition-all duration-200 ease-out overflow-hidden",
    {
      variants: {
        isExpanded: {
          true: "justify-end w-full bg-card rounded-xl px-1 h-11 text-muted-foreground",
          false: "w-10 h-10 bg-transparent rounded-md",
        },
      },
    }
  ),
  input: cva(
    "border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 font-mono shadow-none h-full text-sm font-bold transition-all duration-300",
    {
      variants: {
        isExpanded: {
          true: "w-full opacity-100 ml-1 pl-4",
          false: "w-0 opacity-0 ml-0",
        },
      },
    }
  ),
  button: cva("shrink-0", {
    variants: {
      isExpanded: {
        true: "hover:bg-transparent pointer-events-none",
        false: "",
      },
    },
  }),
};

interface HeaderSearchProps {
  readonly isExpanded?: boolean;
  readonly setIsExpanded: (isExpanded: boolean) => void;
}

export function HeaderSearch({ isExpanded = false, setIsExpanded }: HeaderSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { value, setValue } = useCatalogSearch();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className={headerSearchVariants.container({ isExpanded })}>
      <Input
        ref={inputRef}
        type="text"
        role="searchbox"
        placeholder="Explorar coleções"
        aria-label="Explorar coleções"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={headerSearchVariants.input({ isExpanded })}
        onBlur={(e) => {
          if (!e.target.value) {
            setIsExpanded(false);
          }
        }}
      />
      {isExpanded && value && (
        <Button
          type="button"
          variant="ghostPrimary"
          size="icon-xs"
          aria-label="Limpar busca"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
        >
          <X className="size-5" />
        </Button>
      )}
      <Button
        variant="ghostPrimary"
        size="icon"
        onClick={() => setIsExpanded(true)}
        className={headerSearchVariants.button({ isExpanded })}
      >
        <Icon name='search' className='size-5' />
        <span className="sr-only">Buscar</span>
      </Button>
    </div>
  );
}
