import { io, type Socket } from "socket.io-client";
import type { NftUpdatedEvent, OrderUpdatedEvent, RealtimeEvent } from "@/shared/api/contracts";

export type RealtimeStatus = "connected" | "disconnected";

let socket: Socket | undefined;

/**
 * Lazy singleton. Same-origin `/socket.io/` endpoint over plain WebSocket
 * (no HTTP polling), so the MSW binding can intercept it in demo builds.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({
      path: "/socket.io/",
      transports: ["websocket"],
      autoConnect: false,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5_000,
    });
  }
  return socket;
};

export const connectRealtime = (): Socket => {
  const instance = getSocket();
  if (!instance.connected) instance.connect();
  return instance;
};

/** Drops the connection (e.g. on logout). Event listeners are removed by their owners. */
export const disconnectRealtime = (): void => {
  socket?.disconnect();
};

/** Subscribes to every realtime event; returns the unsubscribe function. */
export const onRealtimeEvent = (listener: (event: RealtimeEvent) => void): (() => void) => {
  const instance = getSocket();
  const onNftUpdated = (event: NftUpdatedEvent) => listener(event);
  const onOrderUpdated = (event: OrderUpdatedEvent) => listener(event);
  instance.on("nft.updated", onNftUpdated);
  instance.on("order.updated", onOrderUpdated);
  return () => {
    instance.off("nft.updated", onNftUpdated);
    instance.off("order.updated", onOrderUpdated);
  };
};

/** Reports connection loss/recovery, so consumers can resync via REST after a dropout. */
export const onRealtimeStatusChange = (listener: (status: RealtimeStatus) => void): (() => void) => {
  const instance = getSocket();
  const onConnect = () => listener("connected");
  const onDisconnect = () => listener("disconnected");
  instance.on("connect", onConnect);
  instance.on("disconnect", onDisconnect);
  return () => {
    instance.off("connect", onConnect);
    instance.off("disconnect", onDisconnect);
  };
};
