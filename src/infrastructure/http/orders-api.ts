import type { Order, OrderInput, OrderStatus } from "@/shared/api/contracts";
import { http } from "@/shared/api/http";

/** Matches the API requirement `/^[A-Za-z0-9_-]{8,80}$/`; generate once per checkout attempt and reuse on retries. */
export const createIdempotencyKey = (): string => crypto.randomUUID();

export const createOrder = async (input: OrderInput, idempotencyKey: string): Promise<Order> => {
  const { data } = await http.post<Order>("/orders", input, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return data;
};

export const listOrders = async (status?: OrderStatus, signal?: AbortSignal): Promise<Order[]> => {
  const { data } = await http.get<{ data: Order[] }>("/orders", {
    ...(status ? { params: { status } } : {}),
    signal,
  });
  return data.data;
};

export const getOrder = async (id: string, signal?: AbortSignal): Promise<Order> => {
  const { data } = await http.get<Order>(`/orders/${id}`, { signal });
  return data;
};
