/**
 * Deterministic mock scenarios. Select with `?scenario=<id>` (persisted),
 * `VITE_MOCK_SCENARIO`, or `window.__mocks.setScenario(id)`.
 */
export interface ScenarioBehavior {
  /** Every request fails with a connection error. */
  offline?: boolean;
  /** GET /api/nfts responds 500. */
  catalogServerError?: boolean;
  /** GET /api/nfts returns zero results. */
  emptyCatalog?: boolean;
  /** Shorter search terms respond slower, so responses arrive out of order. */
  outOfOrder?: boolean;
  /** First request to each URL fails with 503; the retry succeeds. */
  transientOnce?: boolean;
  /** Sessions expire shortly after login. */
  shortSessions?: boolean;
  /** Favorite mutations fail with 500 (optimistic rollback). */
  favoriteFails?: boolean;
  /** Quote changes price after the first quote; orders hit PRICE_CHANGED. */
  priceChangesOnCheckout?: boolean;
  /** Order creation hits OUT_OF_STOCK. */
  soldOutOnCheckout?: boolean;
  /** Order is created, but the response is lost (connection dropped). */
  orderTimeout?: boolean;
  /** Payment ends declined. */
  paymentDeclined?: boolean;
  /** Wallet connection is refused. */
  walletRefuses?: boolean;
}

export interface Scenario {
  id: string;
  label: string;
  latency: { min: number; max: number };
  behavior: ScenarioBehavior;
}

export const SCENARIOS: Scenario[] = [
  { id: "default", label: "Sucesso (latência variável)", latency: { min: 120, max: 380 }, behavior: {} },
  { id: "fast", label: "Sucesso sem latência (testes)", latency: { min: 0, max: 0 }, behavior: {} },
  { id: "slow", label: "Rede lenta", latency: { min: 2000, max: 4000 }, behavior: {} },
  { id: "empty", label: "Resultado vazio", latency: { min: 100, max: 200 }, behavior: { emptyCatalog: true } },
  { id: "out-of-order", label: "Respostas fora de ordem", latency: { min: 50, max: 100 }, behavior: { outOfOrder: true } },
  { id: "offline", label: "Sem conexão", latency: { min: 100, max: 200 }, behavior: { offline: true } },
  { id: "server-error", label: "HTTP 500 no catálogo", latency: { min: 100, max: 200 }, behavior: { catalogServerError: true } },
  { id: "transient", label: "Falha transitória (retry funciona)", latency: { min: 100, max: 200 }, behavior: { transientOnce: true } },
  { id: "session-expired", label: "Sessão expira rápido", latency: { min: 50, max: 100 }, behavior: { shortSessions: true } },
  { id: "favorite-fails", label: "Falha ao favoritar", latency: { min: 100, max: 200 }, behavior: { favoriteFails: true } },
  { id: "price-changed", label: "Preço alterado no checkout", latency: { min: 100, max: 200 }, behavior: { priceChangesOnCheckout: true } },
  { id: "sold-out", label: "Edição esgotada no checkout", latency: { min: 100, max: 200 }, behavior: { soldOutOnCheckout: true } },
  { id: "order-timeout", label: "Timeout após criar pedido", latency: { min: 100, max: 200 }, behavior: { orderTimeout: true } },
  { id: "payment-declined", label: "Pagamento recusado", latency: { min: 100, max: 200 }, behavior: { paymentDeclined: true } },
  { id: "wallet-refuses", label: "Carteira recusa conexão", latency: { min: 100, max: 200 }, behavior: { walletRefuses: true } },
];

export const DEFAULT_SCENARIO_ID = "default";

export const findScenario = (id: string | null | undefined): Scenario =>
  SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[0];
