import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: Readonly<ToasterProps>) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
      }}
      toastOptions={{
        classNames: {
          toast: "border-border bg-surface-card font-mono text-foreground shadow-lg",
          title: "text-sm font-bold text-foreground",
          description: "text-xs text-text-secondary",
          actionButton: "bg-primary text-ink hover:bg-primary-dark",
          cancelButton: "bg-surface-raised text-foreground",
          closeButton: "border-border bg-surface-raised text-foreground hover:bg-surface-dark",
        },
      }}
      style={
        {
          "--normal-bg": "var(--color-surface-card)",
          "--normal-text": "var(--color-foreground)",
          "--normal-border": "var(--color-border-soft)",
          "--border-radius": "var(--radius-xl)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
