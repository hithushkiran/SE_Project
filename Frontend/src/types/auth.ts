// Matching your backend DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  affiliation?: string;
  bio?: string;
  website?: string;
  avatarUrl?: string;
  categoryIds?: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  affiliation?: string;
  bio?: string;
  website?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  role: 'USER' | 'RESEARCHER' | 'ADMIN';
  createdAt?: string;
}