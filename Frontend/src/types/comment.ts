export interface CommentRequest {
  content: string;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  paperId: string;
  author: UserResponse;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface CommentCountResponse {
  success: boolean;
  data: number;
}
