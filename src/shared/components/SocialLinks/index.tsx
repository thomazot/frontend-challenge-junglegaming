import { cn } from "@/shared/utils/utils";
import { Icon, type NameIcons } from "@/shared/components/Icon";

const SOCIAL_DATA: Array<{ name: NameIcons; label: string; href: string }> = [
  {
    name: 'facebook',
    label: 'Facebook',
    href: '#'
  },
  {
    name: 'instagram',
    label: 'Instagram',
    href: '#'
  },
  {
    name: 'linkedin',
    label: 'Linkedin',
    href: '#'
  },
  {
    name: 'twitter',
    label: 'Twitter',
    href: '#'
  },
  {
    name: 'youtube',
    label: 'Youtube',
    href: '#'
  }
]

export function SocialLinks({ variant = "desktop", className }: { variant?: "desktop" | "mobile"; className?: string }) {
  const isMobile = variant === "mobile";
  const linkClass = cn(
    "rounded border border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-ink transition-colors",
    isMobile ? "w-8 h-8" : "w-10 h-10"
  );

  return (
    <div className={cn("flex flex-col", isMobile ? "gap-4" : "gap-4", className)}>
      <h4 className={cn("font-bold text-foreground", isMobile ? "text-[14px]" : "text-[18px]")}>Redes sociais</h4>
      <div className="flex gap-3 flex-wrap">
        {SOCIAL_DATA.map((social, index) => (
          <a key={index} href={social.href} className={linkClass} aria-label={social.label}>
            <Icon name={social.name} className={isMobile ? "size-3" : "size-5"} />
          </a>
        ))}
      </div>
    </div>
  );
}
