import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

async function enableMocking() {
  // Opt-in via configuration; available in dev, preview and demo builds.
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") return;
  const { startMocks } = await import("./infrastructure/mocks/browser");
  await startMocks();
}

enableMocking().then(async () => {
  // Engine.IO captures globalThis.WebSocket at import time; load the app after MSW patches it.
  const { AppProviders } = await import("./app/providers/AppProviders");
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>
  );
});
