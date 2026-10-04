import { setupWorker } from "msw/browser";
import { SCENARIOS, findScenario } from "./scenarios";

export const worker = setupWorker();
let socketHandlersPromise: Promise<void> | undefined;

declare global {
  interface Window {
    __mocks?: {
      scenarios: typeof SCENARIOS;
      current: () => string;
      setScenario: (id: string) => string;
      reset: (id?: string) => Promise<string>;
    };
  }
}

const SCENARIO_STORAGE_KEY = "mocks:scenario";

/** Priority: `?scenario=` (persisted) > stored selection > VITE_MOCK_SCENARIO > default. */
const resolveScenarioId = () => {
  const fromUrl = new URLSearchParams(window.location.search).get("scenario");
  if (fromUrl) {
    const id = findScenario(fromUrl).id;
    localStorage.setItem(SCENARIO_STORAGE_KEY, id);
    return id;
  }
  return localStorage.getItem(SCENARIO_STORAGE_KEY) ?? import.meta.env.VITE_MOCK_SCENARIO ?? undefined;
};

export const startMocks = async () => {
  const { initDb, resetDb, setScenario, currentScenario } = await import("./db");
  await initDb();
  const requested = resolveScenarioId();
  if (requested) setScenario(requested);

  window.__mocks = {
    scenarios: SCENARIOS,
    current: () => currentScenario().id,
    setScenario: (id) => {
      localStorage.setItem(SCENARIO_STORAGE_KEY, findScenario(id).id);
      return setScenario(id).id;
    },
    reset: async (id) => {
      const state = await resetDb(id);
      localStorage.setItem(SCENARIO_STORAGE_KEY, state.scenarioId);
      return state.scenarioId;
    },
  };

  await worker.start({ onUnhandledFrame: "bypass", quiet: true });
  const { handlers } = await import("./handlers");
  worker.use(...handlers);
};

export const startSocketMocks = () => {
  socketHandlersPromise ??= import("./socket").then(({ socketHandlers }) => {
    worker.use(...socketHandlers);
  });
  return socketHandlersPromise;
};
