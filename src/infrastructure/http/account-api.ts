import type { ChangePasswordInput, Profile, UpdateProfileInput } from "@/shared/api/contracts";
import { http } from "@/shared/api/http";

export const getProfile = async (signal?: AbortSignal): Promise<Profile> => {
  const { data } = await http.get<Profile>("/profile", { signal });
  return data;
};

export const updateProfile = async (input: UpdateProfileInput): Promise<Profile> => {
  const { data } = await http.patch<Profile>("/profile", input);
  return data;
};

export const uploadAvatar = async (file: File): Promise<Profile> => {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await http.post<Profile>("/profile/avatar", form);
  return data;
};

export const changePassword = async (input: ChangePasswordInput): Promise<void> => {
  await http.post("/profile/password", input);
};
