import { accountHandlers } from "./handlers/account";
import { authHandlers } from "./handlers/auth";
import { cartHandlers } from "./handlers/cart";
import { catalogHandlers } from "./handlers/catalog";
import { controlHandlers } from "./handlers/control";
import { newsletterHandlers } from "./handlers/newsletter";
import { orderHandlers } from "./handlers/orders";
import { ok, route } from "./server";
import { socketHandlers } from "./socket";

export const handlers = [
  route("get", "/api/health", () => ok({ status: "ok" }), { control: true }),
  ...socketHandlers,
  ...controlHandlers,
  ...authHandlers,
  ...catalogHandlers,
  ...cartHandlers,
  ...orderHandlers,
  ...accountHandlers,
  ...newsletterHandlers,
];
