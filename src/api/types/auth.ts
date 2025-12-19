export interface LoginRequest {
  email: string;
  user_id: string;
}

export interface LoginResponse {
  success: boolean;
  session_token: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
}
