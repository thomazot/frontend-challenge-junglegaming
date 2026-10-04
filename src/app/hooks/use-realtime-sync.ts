import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Nft, NftListResponse, Order, RealtimeEvent } from "@/shared/api/contracts";
import { useSession } from "@/features/auth/hooks/use-auth";
import { disconnectRealtime, loadSocketClient } from "@/infrastructure/socket/lifecycle";

const seenEventIds = new Set<string>();
const latestVersions = new Map<string, number>();
const EVENT_HISTORY_LIMIT = 500;

const updateNft = (nft: Nft, event: Extract<RealtimeEvent, { type: "nft.updated" }>): Nft => ({
  ...nft,
  price: event.payload.price,
  oldPrice: event.payload.oldPrice,
  edition: { ...nft.edition, available: event.payload.available },
  version: event.version,
  updatedAt: event.at,
});

const updateOrder = (order: Order, event: Extract<RealtimeEvent, { type: "order.updated" }>): Order => ({
  ...order,
  status: event.payload.status,
  ...(event.payload.txHash ? { txHash: event.payload.txHash } : {}),
  ...(event.payload.declineReason ? { declineReason: event.payload.declineReason } : {}),
  version: event.version,
  updatedAt: event.at,
});

const isNewEvent = (event: RealtimeEvent) => {
  const key = `${event.resource.type}:${event.resource.id}`;
  if (seenEventIds.has(event.id) || event.version <= (latestVersions.get(key) ?? 0)) return false;

  seenEventIds.add(event.id);
  latestVersions.set(key, event.version);
  if (seenEventIds.size > EVENT_HISTORY_LIMIT) {
    const oldest = seenEventIds.values().next().value;
    if (oldest) seenEventIds.delete(oldest);
  }
  return true;
};

const handleRealtimeEvent = (
  queryClient: ReturnType<typeof useQueryClient>,
  event: RealtimeEvent,
) => {
  if (!isNewEvent(event)) return;

  if (event.type === "nft.updated") {
    const nftId = event.resource.id;
    let matchedCachedData = false;

    queryClient.setQueryData<Nft>(["nft", nftId], (current) => {
      if (!current || current.version >= event.version) return current;
      matchedCachedData = true;
      return updateNft(current, event);
    });
    queryClient.setQueriesData<Nft>({ queryKey: ["nft"] }, (current) => {
      if (!current || current.id !== nftId || current.version >= event.version) return current;
      matchedCachedData = true;
      return updateNft(current, event);
    });
    queryClient.setQueriesData<NftListResponse>({ queryKey: ["nfts"] }, (current) => {
      if (!current) return current;
      let listMatched = false;
      const data = current.data.map((nft) => {
        if (nft.id !== nftId || nft.version >= event.version) return nft;
        listMatched = true;
        return updateNft(nft, event);
      });
      matchedCachedData ||= listMatched;
      return listMatched ? { ...current, data } : current;
    });

    if (matchedCachedData) {
      toast.warning(
        event.payload.available === 0
          ? "Este NFT acabou de esgotar"
          : `O preço ou a disponibilidade de ${nftId} foi atualizado`,
      );
    }
    void queryClient.invalidateQueries({ queryKey: ["nfts"] });
    void queryClient.invalidateQueries({ queryKey: ["nft"] });
    void queryClient.invalidateQueries({ queryKey: ["cart"] });
    void queryClient.invalidateQueries({ queryKey: ["quote"] });
    return;
  }

  const orderId = event.resource.id;
  let matchedCachedData = false;
  queryClient.setQueryData<Order>(["order", orderId], (current) => {
    if (!current || current.version >= event.version) return current;
    matchedCachedData = true;
    return updateOrder(current, event);
  });
  queryClient.setQueriesData<{ data: Order[] }>({ queryKey: ["orders"] }, (current) => {
    if (!current) return current;
    let listMatched = false;
    const data = current.data.map((order) => {
      if (order.id !== orderId || order.version >= event.version) return order;
      listMatched = true;
      return updateOrder(order, event);
    });
    matchedCachedData ||= listMatched;
    return listMatched ? { ...current, data } : current;
  });

  if (event.payload.status === "confirmed") toast.success(`Pedido ${orderId} confirmado`);
  if (event.payload.status === "declined") toast.error(event.payload.declineReason ?? `Pedido ${orderId} recusado`);
  if (matchedCachedData) {
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
    void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
  }
};

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const sessionQuery = useSession();
  const userId = sessionQuery.data?.user?.id;

  useEffect(() => {
    if (!userId) {
      disconnectRealtime();
      return;
    }

    let isCurrentSession = true;
    let hasConnected = false;
    let connectionWasInterrupted = false;
    let unsubscribeEvents = () => {};
    let unsubscribeStatus = () => {};

    const connect = async () => {
      if (import.meta.env.VITE_ENABLE_MOCKS === "true") {
        const { startSocketMocks } = await import("@/infrastructure/mocks/browser");
        await startSocketMocks();
      }
      if (!isCurrentSession) return;

      const socketClient = await loadSocketClient();
      if (!isCurrentSession) return;

      unsubscribeEvents = socketClient.onRealtimeEvent((event) => handleRealtimeEvent(queryClient, event));
      unsubscribeStatus = socketClient.onRealtimeStatusChange((status) => {
        if (status === "disconnected") {
          if (hasConnected) connectionWasInterrupted = true;
          return;
        }
        if (hasConnected && connectionWasInterrupted) {
          void queryClient.invalidateQueries({ queryKey: ["nfts"] });
          void queryClient.invalidateQueries({ queryKey: ["nft"] });
          void queryClient.invalidateQueries({ queryKey: ["cart"] });
          void queryClient.invalidateQueries({ queryKey: ["orders"] });
          void queryClient.invalidateQueries({ queryKey: ["order"] });
          toast.success("Conexão restabelecida; dados sincronizados");
        }
        hasConnected = true;
        connectionWasInterrupted = false;
      });
      socketClient.connectRealtime();
    };

    void connect().catch(() => {
      if (isCurrentSession) toast.error("Não foi possível iniciar a conexão em tempo real");
    });
    return () => {
      isCurrentSession = false;
      unsubscribeEvents();
      unsubscribeStatus();
      disconnectRealtime();
    };
  }, [queryClient, userId]);
}
