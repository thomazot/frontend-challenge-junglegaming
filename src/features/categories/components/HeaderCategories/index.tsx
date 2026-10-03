import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "../../constants/categories.const";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Logo } from "@/shared/components/Logo";
import { Separator } from "@/shared/ui/separator";
import { SocialLinks } from "@/shared/components/SocialLinks";
import { CompatibleWallets } from "@/shared/components/CompatibleWallets";
import { ContactInfo } from "@/shared/components/ContactInfo";

interface HeaderCategoriesProps {
  readonly children: ReactNode;
}

export function HeaderCategories({ children }: HeaderCategoriesProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-70 sm:w-80 p-0 border-r border-border/30 bg-background shadow-2xl flex flex-col h-full">
        <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 shrink-0">
          <SheetTitle className="text-left">
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col py-6 px-4 gap-1">
            {CATEGORIES.map((category, index) => (
              <div key={category.id} className="flex flex-col gap-1">
                <Link
                  to={category.href}
                  className="px-4 py-3 text-muted-foreground font-medium text-sm rounded-lg hover:text-primary hover:bg-muted/40 transition-all duration-300 tracking-wide"
                >
                  {category.label}
                </Link>
                {index < CATEGORIES.length - 1 && <Separator className="my-1 bg-border/40" />}
              </div>
            ))}

            <Separator className="my-6 bg-border/40" />

            <SocialLinks variant="mobile" className="px-4" />

            <CompatibleWallets variant="mobile" className="px-4 mt-8" />

            <ContactInfo className="px-4 mt-10 flex flex-col items-center gap-1 text-xs text-muted-foreground mb-6" />

          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
