import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "./app/providers/AppProviders";
import "./index.css";

async function enableMocking() {
  // Opt-in via configuration; available in dev, preview and demo builds.
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") return;
  const { startMocks } = await import("./infrastructure/mocks/browser");
  await startMocks();
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>
  );
});
