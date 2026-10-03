import type { Cart, CartItem, Quote } from "@/shared/api/contracts";
import { http } from "@/shared/api/http";

export const getCart = async (signal?: AbortSignal): Promise<Cart> => {
  const { data } = await http.get<Cart>("/cart", { signal });
  return data;
};

/** Fresh quote: authoritative prices, availability, coupon and fees. Call before checkout review. */
export const getCartQuote = async (signal?: AbortSignal): Promise<Quote> => {
  const { data } = await http.get<Quote>("/cart/quote", { signal });
  return data;
};

export const addCartItem = async (item: CartItem): Promise<Cart> => {
  const { data } = await http.post<Cart>("/cart/items", item);
  return data;
};

export const setCartItemQuantity = async (nftId: string, quantity: number): Promise<Cart> => {
  const { data } = await http.patch<Cart>(`/cart/items/${nftId}`, { quantity });
  return data;
};

export const removeCartItem = async (nftId: string): Promise<Cart> => {
  const { data } = await http.delete<Cart>(`/cart/items/${nftId}`);
  return data;
};

export const applyCoupon = async (code: string): Promise<Cart> => {
  const { data } = await http.put<Cart>("/cart/coupon", { code });
  return data;
};

export const removeCoupon = async (): Promise<Cart> => {
  const { data } = await http.delete<Cart>("/cart/coupon");
  return data;
};
