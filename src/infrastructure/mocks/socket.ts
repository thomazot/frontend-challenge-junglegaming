import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import { subscribeEvents } from "./events";
import { readSession } from "./server";

const socketIoUrl = (): string => {
  const url = new URL("/socket.io/", window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
};

const realtime = ws.link(socketIoUrl());

const readCookies = (): Record<string, string> =>
  Object.fromEntries(
    document.cookie
      .split("; ")
      .filter(Boolean)
      .map((entry) => {
        const separator = entry.indexOf("=");
        return [entry.slice(0, separator), decodeURIComponent(entry.slice(separator + 1))];
      }),
  );

/**
 * Mocked Socket.IO server. Bridges the in-process event bus (fed by the REST
 * handlers) to connected clients, resolving the audience per event so a
 * session change (login/logout) never leaks user-scoped events.
 */
export const socketHandlers = [
  realtime.addEventListener("connection", (connection) => {
    const io = toSocketIo(connection);
    const unsubscribe = subscribeEvents(({ event, audienceUserId }) => {
      if (audienceUserId && readSession(readCookies()).user?.id !== audienceUserId) return;
      io.server.emit(event.type, event);
    });
    io.rawClient.addEventListener("close", () => unsubscribe());
  }),
];
