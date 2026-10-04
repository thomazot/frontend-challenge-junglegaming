import { Suspense } from "react";
import { cn } from "@/shared/utils/utils";

export type NameIcons =
  'search' | 'search-mobile' |
  'cart' |
  'facebook' | 'email' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' |
  'footer-notch' | 'jungle-logo' |
  'home' | 'heart' | 'heart-outline' | 'user' | 'buy' | 'cart-buy' |
  'logout' | 'filter' |
  'cart-solid' | 'filter-header' | 'arrow-right' | 'verified';

export type IconProps = {
  name: NameIcons;
  className?: string;
  set?: "bold" | "curved" | "broken" | "outline" | "bulk" | "two-tone";
  size?: number | string;
  primaryColor?: string;
  "data-icon"?: "inline-start" | "inline-end";
};

const svgModules = import.meta.glob('../../../assets/icons/*.svg', {
  eager: true,
  query: '?react',
  import: 'default'
});

export function Icon({ name, className, set = "bold", size = 24, primaryColor, "data-icon": dataIcon }: Readonly<IconProps>) {
  const fileName = name === "filter" && set === "bold" ? "filter-bold" : name;
  const SvgComponent = svgModules[`../../../assets/icons/${fileName}.svg`] as React.ComponentType<{ className?: string; width?: number | string; height?: number | string; style?: React.CSSProperties }>;
  if (!SvgComponent) return null;

  return (
    <Suspense fallback={<div className={cn("size-6 bg-muted animate-pulse rounded-full inline-block", className)} />}>
      <SvgComponent className={className} width={size} height={size} data-icon={dataIcon} style={primaryColor ? { color: primaryColor } : undefined} />
    </Suspense>
  );
}
