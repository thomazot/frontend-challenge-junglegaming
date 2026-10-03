import type { RealtimeEvent } from "@/shared/api/contracts";

export interface ServerEvent {
  event: RealtimeEvent;
  /** When set, only this user's sockets may receive the event. */
  audienceUserId?: string;
}

type Listener = (serverEvent: ServerEvent) => void;

const listeners = new Set<Listener>();

/** In-process bus: REST handlers publish, the Socket.IO mock subscribes. */
export const publishEvent = (serverEvent: ServerEvent) => {
  listeners.forEach((listener) => listener(serverEvent));
};

export const subscribeEvents = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
