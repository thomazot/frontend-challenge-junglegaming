import { Link } from "@tanstack/react-router";

interface LogoProps {
  readonly className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={`flex h-4.5 items-center ${className || ""}`}>
      <span className="font-mono text-base leading-4.5 font-bold tracking-widest text-foreground uppercase">
        KURIO
      </span>
    </Link>
  );
}
