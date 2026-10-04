import { useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { useNewsletterSubscription } from "@/features/newsletter/hooks/use-newsletter-subscription";
import { newsletterSubscriptionSchema } from "@/shared/api/schemas";
import { toApiError } from "@/shared/api/http";
import { Button } from "@/shared/ui/button";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { subscribe, isSubscribing } = useNewsletterSubscription();

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = newsletterSubscriptionSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "E-mail inválido");
      return;
    }

    setError("");
    try {
      const result = await subscribe(parsed.data);
      setEmail("");
      if (result.alreadySubscribed) {
        toast.info("Este e-mail já está inscrito na newsletter");
      } else {
        toast.success("Inscrição realizada! Você receberá as novidades da Kurio.");
      }
    } catch (requestError) {
      const apiError = toApiError(requestError);
      setError(apiError.fieldErrors?.email ?? "");
      toast.error(apiError.message);
    }
  };

  return (
    <form className="flex w-full flex-col gap-1" noValidate onSubmit={handleSubmit}>
      <div className="flex h-10 w-full items-center justify-between rounded-md bg-surface-dark pl-3 shadow-[0_0_20px_0_rgba(10,6,4,0.45)]">
        <input
          type="email"
          name="email"
          aria-label="E-mail para newsletter"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "newsletter-email-error" : undefined}
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          placeholder="digite seu e-mail..."
          className="newsletter-email-input h-full w-full border-none bg-transparent text-sm text-foreground caret-primary outline-none placeholder:text-secondary focus:bg-transparent focus:text-foreground focus:placeholder:text-secondary focus-visible:ring-0"
        />
        <Button
          type="submit"
          disabled={isSubscribing}
          className="h-full rounded-l-none rounded-r-[6px] bg-primary px-6 text-sm font-bold text-ink hover:bg-primary/90"
        >
          {isSubscribing ? "Enviando..." : "Enviar"}
        </Button>
      </div>
      {error && (
        <span id="newsletter-email-error" role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </form>
  );
}
