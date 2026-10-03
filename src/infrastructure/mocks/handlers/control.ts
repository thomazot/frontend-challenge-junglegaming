import { z } from "zod";
import { ethSchema } from "@/shared/api/schemas";
import { currentScenario, mutateDb, resetDb, setScenario } from "../db";
import { SCENARIOS } from "../scenarios";
import { updateNft } from "../domain";
import { ok, parse, route } from "../server";

const resetSchema = z.object({ scenario: z.string().max(40).optional() });
const scenarioSchema = z.object({ id: z.string().max(40) });
const nftChangeSchema = z.object({ price: ethSchema.optional(), available: z.number().int().min(0).max(10_000).optional() });

const state = () => ({
  scenario: currentScenario().id,
  scenarios: SCENARIOS.map(({ id, label }) => ({ id, label })),
});

/** Control plane for demos and tests. Not part of the product API; skips scenario injection. */
export const controlHandlers = [
  route("get", "/api/__mocks__/state", () => ok(state()), { control: true }),

  route("post", "/api/__mocks__/reset", async (ctx) => {
    const { scenario } = parse(resetSchema, await ctx.json().catch(() => ({})));
    await resetDb(scenario);
    return ok(state());
  }, { control: true }),

  route("post", "/api/__mocks__/scenario", async (ctx) => {
    const { id } = parse(scenarioSchema, await ctx.json());
    setScenario(id);
    return ok(state());
  }, { control: true }),

  route("post", "/api/__mocks__/expire-session", (ctx) => {
    mutateDb((db) => {
      const session = ctx.cookies.sid ? db.sessions[ctx.cookies.sid] : undefined;
      if (session) session.expiresAt = Date.now() - 1;
    });
    return ok(state());
  }, { control: true }),

  /** Changes price/availability and emits the matching `nft.updated` event. */
  route("patch", "/api/__mocks__/nfts/:id", async (ctx) => {
    const change = parse(nftChangeSchema, await ctx.json());
    return ok(updateNft(ctx.params.id, change));
  }, { control: true }),
];
