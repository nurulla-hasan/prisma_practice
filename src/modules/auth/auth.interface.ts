export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}