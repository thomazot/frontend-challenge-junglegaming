import { Suspense } from "react";
import { cn } from "@/shared/utils/utils";

export type NameIcons =
  'search' | 'search-mobile' |
  'cart' |
  'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' |
  'footer-notch' | 'jungle-logo' |
  'home' | 'heart' | 'user' | 'buy' |
  'logout' | 'filter' |
  'cart-solid' | 'filter-header' | 'arrow-right';

export type IconProps = {
  name: NameIcons;
  className?: string;
  set?: "bold" | "curved" | "broken" | "outline" | "bulk" | "two-tone";
  size?: number | string;
  primaryColor?: string;
};

const svgModules = import.meta.glob('../../../assets/icons/*.svg', {
  eager: true,
  query: '?react',
  import: 'default'
});

export function Icon({ name, className, set = "bold", size }: Readonly<IconProps>) {
  const fileName = name === "filter" && set === "bold" ? "filter-bold" : name;
  const SvgComponent = svgModules[`../../../assets/icons/${fileName}.svg`] as React.ComponentType<{ className?: string; width?: number | string; height?: number | string }>;
  if (!SvgComponent) return null;

  return (
    <Suspense fallback={<div className={cn("size-6 bg-muted animate-pulse rounded-full inline-block", className)} />}>
      <SvgComponent className={className} width={size} height={size} />
    </Suspense>
  );
}
