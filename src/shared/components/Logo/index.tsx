import { Link } from "@tanstack/react-router";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center ${className || ""}`}>
      <span className="font-bold text-xl tracking-widest text-foreground uppercase font-mono">
        KURIO
      </span>
    </Link>
  );
}
