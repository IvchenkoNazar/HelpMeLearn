// Auth DTOs
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface RefreshRequest {
  refreshToken: string;
}

// Profile
export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  subscriptionTier: 'free' | 'premium';
  streakCount: number;
  lastActivityDate: string | null;
  dailyGoal: number;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
  dailyGoal?: number;
}

// API error
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
