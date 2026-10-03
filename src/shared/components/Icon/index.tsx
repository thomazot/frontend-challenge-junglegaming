import { Suspense } from "react";
import { cn } from "@/shared/utils/utils";
import { Home, Heart, User, Logout, Filter } from "react-iconly";

export type NameIcons =
  'search' | 'search-mobile' |
  'cart' |
  'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' |
  'footer-notch' | 'jungle-logo' |
  'home' | 'heart' | 'user' | 'buy' |
  'logout' | 'filter' |
  'cart-solid' | 'filter-header';

export type IconProps = {
  name: NameIcons;
  className?: string;
  set?: "bold" | "curved" | "broken" | "outline" | "bulk" | "two-tone";
  size?: number | string;
  primaryColor?: string;
};

const iconlyMap = {
  home: Home,
  heart: Heart,
  user: User,
  logout: Logout,
  filter: Filter,
};

const svgModules = import.meta.glob('../../../assets/icons/*.svg', {
  eager: true,
  query: '?react',
  import: 'default'
});

export function Icon({ name, className, set = "bold", size, primaryColor = "currentColor" }: Readonly<IconProps>) {
  if (name in iconlyMap) {
    const IconlyComponent = iconlyMap[name as keyof typeof iconlyMap];
    // @ts-ignore - react-iconly types might not perfectly match
    return <IconlyComponent set={set} size={size} primaryColor={primaryColor} className={className} />;
  }

  const SvgComponent = svgModules[`../../../assets/icons/${name}.svg`] as React.ComponentType<{ className?: string }>;
  if (!SvgComponent) return null;

  return (
    <Suspense fallback={<div className={cn("size-6 bg-muted animate-pulse rounded-full inline-block", className)} />}>
      <SvgComponent className={className} />
    </Suspense>
  );
}
