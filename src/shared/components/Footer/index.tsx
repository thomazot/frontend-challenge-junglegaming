import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { FooterDesktop } from "./FooterDesktop";
import { FooterMobile } from "./FooterMobile";

export function Footer() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return isDesktop ? <FooterDesktop /> : <FooterMobile />;
}
