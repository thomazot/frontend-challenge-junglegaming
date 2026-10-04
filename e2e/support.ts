import { expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __mocks?: {
      reset: (scenario: string) => string;
    };
  }
}

export async function resetMockState(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => "__mocks" in window, undefined, { timeout: 15_000 });
  const scenario = await page.evaluate(() => window.__mocks?.reset("fast"));
  expect(scenario).toBe("fast");
  await page.reload();
  await expect(page.getByRole("tab", { name: "Todos os NFTs" })).toBeVisible();
}

export async function signIn(page: Page) {
  await page.getByRole("button", { name: "Entrar" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("E-mail", { exact: true }).fill("ana@jungle.test");
  await dialog.getByLabel("Senha", { exact: true }).fill("Jungle#2024-ana");
  await dialog.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("button", { name: /Sair/ })).toBeVisible();
}

export async function waitForImages(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.querySelectorAll<HTMLImageElement>("main img"));
    await Promise.all(images.map((image) => {
      image.loading = "eager";
      return image.decode().catch(() => undefined);
    }));
  });
}
