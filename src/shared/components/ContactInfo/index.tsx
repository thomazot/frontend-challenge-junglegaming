import { cn } from "cn";

export function ContactInfo({ asWrapper = true, className }: { asWrapper?: boolean; className?: string }) {
  const content = (
    <>
      <span>contato@email.com</span>
      <span>+55 11 4002 8922</span>
    </>
  );

  if (!asWrapper) return content;
  return <div className={cn(className)}>{content}</div>;
}
