import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

async function enableMocking() {
  // Opt-in via configuration; available in dev, preview and demo builds.
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") return;
  const { startMocks } = await import("./infrastructure/mocks/browser");
  await startMocks();
}

const appProviders = import("./app/providers/AppProviders");
const mocking = enableMocking();

void Promise.all([appProviders, mocking])
  .then(([{ AppProviders }]) => {
    const root = document.getElementById("root");
    if (!root) throw new Error("Root element was not found");
    createRoot(root).render(
      <StrictMode>
        <AppProviders />
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error("Application startup failed", error);
    const root = document.getElementById("root");
    if (root) root.textContent = "Não foi possível iniciar a aplicação. Recarregue a página.";
  });
