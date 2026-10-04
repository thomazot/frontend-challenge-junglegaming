import type { NewsletterSubscription, NewsletterSubscriptionInput } from "@/shared/api/contracts";
import { http } from "@/shared/api/http";

export const subscribeToNewsletter = async (
  input: NewsletterSubscriptionInput,
): Promise<NewsletterSubscription> => {
  const { data } = await http.post<NewsletterSubscription>("/newsletter/subscriptions", input);
  return data;
};
