import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: ProfileUpdateData) =>
      api.patch<{ user: any; message: string }>("/users/profile", data),
    onSuccess: (response) => {
      if (response.user) {
        updateUser({
          name: response.user.name,
          email: response.user.email,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
