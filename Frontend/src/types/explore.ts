export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
}

export interface PaperResponse {
  id: string;
  title: string;
  author: string;
  abstractSnippet: string;
  uploadedAt: string;
  publicationYear: number | null;
  filePath: string;
  categories: CategoryResponse[];
  canEdit?: boolean | null;
}

export interface ExploreFilters {
  query: string;
  categories: string[];
  year: number | null;
  author: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}
