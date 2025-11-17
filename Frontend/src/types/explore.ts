export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
}

export interface AuthorInfo {
  id: string;
  name: string | null;
  maskedEmail: string | null;
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
  uploadedById: string;
  uploadedByName: string;
  canEdit: boolean;
  authorInfo?: AuthorInfo | null;
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
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}
