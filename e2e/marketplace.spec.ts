import { expect, test } from "@playwright/test";
import { resetMockState, signIn, waitForImages } from "./support";

test.beforeEach(async ({ page }) => {
  await resetMockState(page);
});

test("catalog filters and search survive refresh in the URL", async ({ page }) => {
  await page.getByRole("tab", { name: "Novos lançamentos" }).click();
  await expect(page).toHaveURL(/tab=novos/);

  const search = page.getByRole("searchbox", { name: "Explorar coleções" });
  if ((page.viewportSize()?.width ?? 0) < 768) {
    await expect(search).toBeVisible();
  } else {
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(search).toBeVisible();
  }
  await search.fill("Emerald");
  await expect(page).toHaveURL(/q=Emerald/, { timeout: 5_000 });
  await page.reload();

  await expect(page.getByRole("searchbox", { name: "Explorar coleções" })).toHaveValue("Emerald");
  await expect(page.getByRole("tab", { name: "Novos lançamentos" })).toHaveAttribute("aria-selected", "true");
});

test("direct NFT route renders details and reports missing NFTs", async ({ page }) => {
  await page.goto("/nft/emerald-ape-000");
  await expect(page.getByRole("heading", { name: "Emerald Ape #042" })).toBeVisible();
  await expect(page.getByText("1.19 ETH").last()).toBeVisible();

  await page.goto("/nft/not-a-real-nft");
  await expect(page.getByText("NFT não encontrado.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
});

test("signed-in favorite mutation rolls back on a simulated server failure", async ({ page }) => {
  await signIn(page);
  await page.goto("/nft/emerald-ape-000");
  const favoriteButton = page.getByRole("button", { name: "Favoritar NFT" });
  await expect(favoriteButton).toBeEnabled();
  await favoriteButton.click();
  await expect(page.getByRole("button", { name: "Remover NFT dos favoritos" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("NFT adicionado aos favoritos")).toBeVisible();

  await page.evaluate(async () => {
    const response = await fetch("/api/__mocks__/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "favorite-fails" }),
    });
    if (!response.ok) throw new Error("Could not select favorite-fails scenario");
  });

  await page.getByRole("button", { name: "Remover NFT dos favoritos" }).click();
  await expect(page.getByText("Não foi possível remover o favorito")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remover NFT dos favoritos" })).toHaveAttribute("aria-pressed", "true");
});

test("mobile footer user action opens the authentication dialog", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const userAction = page.getByRole("button", { name: "Entrar" });
  await expect(userAction).toBeVisible();
  await userAction.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("mobile header does not request desktop cart data", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const cartRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/cart") cartRequests.push(request.url());
  });

  await page.reload();
  await expect(page.getByRole("tab", { name: "Todos os NFTs" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Emerald Ape/ }).first()).toBeVisible();
  expect(cartRequests).toEqual([]);
});

test("anonymous session lookup returns an empty session without an HTTP error", async ({ page }) => {
  const response = await page.evaluate(async () => {
    const result = await fetch("/api/auth/session");
    return { status: result.status, body: await result.json() };
  });
  expect(response).toEqual({ status: 200, body: null });
});

test("catalog and NFT schemas reject missing pagination and identity fields", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const moduleUrl = new URL("/src/shared/api/schemas.ts", window.location.origin).href;
    const { nftListResponseSchema, nftSchema } = await import(moduleUrl);
    const nft = {
      id: "42",
      slug: "emerald-ape-042",
      name: "Emerald Ape #042",
      description: "A digital collectible.",
      image: "/images/emerald-ape-042.webp",
      collection: "Kurio Apes",
      network: "Ethereum",
      creator: "Kurio Editions",
      price: "1.19",
      tags: [],
      edition: { total: 50, available: 10 },
      maxPerOrder: 5,
      version: 1,
      updatedAt: "2026-01-10T10:00:00.000Z",
    };
    const facets = { collections: [], networks: [], priceRange: { min: "0.01", max: "1.19" } };
    const nftWithoutId = Object.fromEntries(Object.entries(nft).filter(([key]) => key !== "id"));

    return {
      validNft: nftSchema.safeParse(nft).success,
      missingId: nftSchema.safeParse(nftWithoutId).success,
      missingTotalPages: nftListResponseSchema.safeParse({
        data: [nft],
        meta: { total: 1, page: 1, limit: 20 },
        facets,
      }).success,
    };
  });

  expect(result).toEqual({ validNft: true, missingId: false, missingTotalPages: false });
});

test("authenticated Socket.IO subscription applies newer NFT updates to the page", async ({ page }) => {
  await signIn(page);
  await expect.poll(() => page.evaluate(async () => {
    const moduleUrl = new URL("/src/infrastructure/socket/client.ts", window.location.origin).href;
    const { getSocket } = await import(moduleUrl);
    return getSocket().connected;
  }), { timeout: 15_000 }).toBe(true);
  await page.goto("/nft/emerald-ape-000");
  await expect(page.getByText("1.19 ETH").last()).toBeVisible();
  await page.route("**/api/nfts/emerald-ape-000", (route) => route.abort());

  const result = await page.evaluate(async () => {
    const response = await fetch("/api/__mocks__/nfts/42", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: "1.45", available: 7 }),
    });
    return { status: response.status, body: await response.text() };
  });
  expect(result.status, result.body).toBe(200);
  await expect(page.getByText("O preço ou a disponibilidade de 42 foi atualizado")).toBeVisible();
  await expect(page.getByText("1.45 ETH").filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText("1/7").filter({ visible: true }).first()).toBeVisible();
});

test("visual baseline: desktop or mobile home catalog", async ({ page }) => {
  await waitForImages(page);
  const screenshot = await page.locator("main").first().screenshot({
    animations: "disabled",
    caret: "hide",
  });
  expect(screenshot).toMatchSnapshot("home-catalog.png", { maxDiffPixelRatio: 0.015 });
});

test("visual baseline: desktop or mobile NFT detail", async ({ page }) => {
  await page.goto("/nft/emerald-ape-000");
  await expect(page.getByRole("heading", { name: "Emerald Ape #042" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByRole("heading", { name: "Mais desta coleção" })).toBeVisible();
  await waitForImages(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  const screenshot = await page.locator("main").first().screenshot({
    animations: "disabled",
    caret: "hide",
  });
  expect(screenshot).toMatchSnapshot("nft-detail.png", { maxDiffPixelRatio: 0.015 });
});
