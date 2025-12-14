// Authentication Type Definitions

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  password_confirm: string;
  name: string;
  phone: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds
}

export interface UserInfo {
  email: string;
  name: string;
  phone: string;
}

export interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

// Password validation
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}
