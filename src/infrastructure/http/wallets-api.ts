import type { NetworkId, Wallet, WalletInput } from "@/shared/api/contracts";
import { http } from "@/shared/api/http";

export interface WalletConnection {
  connected: boolean;
  address?: string;
  network?: NetworkId;
}

export const listWallets = async (signal?: AbortSignal): Promise<Wallet[]> => {
  const { data } = await http.get<{ data: Wallet[] }>("/wallets", { signal });
  return data.data;
};

export const createWallet = async (input: WalletInput): Promise<Wallet> => {
  const { data } = await http.post<Wallet>("/wallets", input);
  return data;
};

export const updateWallet = async (id: string, input: Partial<WalletInput>): Promise<Wallet> => {
  const { data } = await http.patch<Wallet>(`/wallets/${id}`, input);
  return data;
};

/** Simulates the wallet handshake; rejects with WALLET_REJECTED when the wallet refuses. */
export const connectWallet = async (id: string): Promise<WalletConnection> => {
  const { data } = await http.post<WalletConnection>(`/wallets/${id}/connect`);
  return data;
};

export const disconnectWallet = async (id: string): Promise<WalletConnection> => {
  const { data } = await http.post<WalletConnection>(`/wallets/${id}/disconnect`);
  return data;
};
