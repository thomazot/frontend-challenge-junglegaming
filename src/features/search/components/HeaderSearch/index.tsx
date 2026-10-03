import { useRef, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cva } from "class-variance-authority";
import { Icon } from "@/shared/components/Icon";

const headerSearchVariants = {
  container: cva(
    "flex items-center transition-all duration-200 ease-out overflow-hidden",
    {
      variants: {
        isExpanded: {
          true: "justify-end w-full bg-card rounded-[10px] px-1 h-11.25 text-muted-foreground",
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

type HeaderSearchProps = {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

export function HeaderSearch({ isExpanded = false, setIsExpanded }: Readonly<HeaderSearchProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className={headerSearchVariants.container({ isExpanded })}>
      <Input
        ref={inputRef}
        type="search"
        placeholder="Explorar coleções"
        className={headerSearchVariants.input({ isExpanded })}
        onBlur={(e) => {
          if (!e.target.value) {
            setIsExpanded(false);
          }
        }}
      />
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
