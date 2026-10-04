import { useMutation } from "@tanstack/react-query";
import type { NewsletterSubscriptionInput } from "@/shared/api/contracts";
import { subscribeToNewsletter } from "@/infrastructure/http/newsletter-api";

export function useNewsletterSubscription() {
  const mutation = useMutation({
    mutationKey: ["newsletter", "subscribe"],
    mutationFn: (input: NewsletterSubscriptionInput) => subscribeToNewsletter(input),
    gcTime: 0,
  });

  const subscribe = async (input: NewsletterSubscriptionInput) => {
    try {
      return await mutation.mutateAsync(input);
    } finally {
      mutation.reset();
    }
  };

  return { subscribe, isSubscribing: mutation.isPending };
}
