import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    user_id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export function useLoginMutation() {
  const { login } = useAuthStore();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<LoginResponse>("/auth/login", credentials);
      return response;
    },
    onSuccess: (data) => {
      login(
        {
          id: data.user.user_id,
          name: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
        },
        data.accessToken,
        data.refreshToken
      );
    },
  });
}
