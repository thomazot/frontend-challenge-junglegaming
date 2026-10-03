import { Link } from "@tanstack/react-router";

interface LogoProps {
  readonly className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center ${className || ""}`}>
      <span className="font-bold text-xl tracking-widest text-foreground uppercase font-mono">
        KURIO
      </span>
    </Link>
  );
}
