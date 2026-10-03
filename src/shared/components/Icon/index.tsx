import { lazy, Suspense } from "react";
import { cn } from "@/shared/utils/utils";
import * as Iconly from "react-iconly";

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
  home: Iconly.Home,
  heart: Iconly.Heart,
  user: Iconly.User,
  logout: Iconly.Logout,
  filter: Iconly.Filter,
};

export function Icon({ name, className, set = "bold", size, primaryColor = "currentColor" }: Readonly<IconProps>) {
  if (name in iconlyMap) {
    const IconlyComponent = iconlyMap[name as keyof typeof iconlyMap];
    // @ts-ignore - react-iconly types might not perfectly match
    return <IconlyComponent set={set} size={size} primaryColor={primaryColor} className={className} />;
  }

  const SvgComponent = lazy(() => import(`../../../assets/icons/${name}.svg?react`));

  return (
    <Suspense fallback={<div className={cn("size-6 bg-muted animate-pulse rounded-full inline-block", className)} />}>
      <SvgComponent className={className} />
    </Suspense>
  );
}
