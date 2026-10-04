import type { NewsletterSubscription } from "@/shared/api/contracts";
import { newsletterSubscriptionSchema } from "@/shared/api/schemas";
import { mutateDb } from "../db";
import { ok, parse, route } from "../server";

export const newsletterHandlers = [
  route("post", "/api/newsletter/subscriptions", async (ctx) => {
    const input = parse(newsletterSubscriptionSchema, await ctx.json());
    const result = mutateDb((db): NewsletterSubscription => {
      const existing = db.newsletterSubscribers.find((subscriber) => subscriber.email === input.email);
      if (existing) {
        return { ...existing, alreadySubscribed: true };
      }
      const subscriber = { email: input.email, subscribedAt: new Date().toISOString() };
      db.newsletterSubscribers.push(subscriber);
      return { ...subscriber, alreadySubscribed: false };
    });
    return ok(result, { status: result.alreadySubscribed ? 200 : 201 });
  }),
];
