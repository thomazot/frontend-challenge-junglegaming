import { cn } from "cn";

interface ContactInfoProps {
  readonly asWrapper?: boolean;
  readonly className?: string;
}

export function ContactInfo({ asWrapper = true, className }: ContactInfoProps) {
  const content = (
    <>
      <span>contato@email.com</span>
      <span>+55 11 4002 8922</span>
    </>
  );

  if (!asWrapper) return content;
  return <div className={cn(className)}>{content}</div>;
}
