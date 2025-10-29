import { CategoryResponse, PaginatedResponse } from './explore';

export interface LibraryItem {
  id: number;
  paperId: string;
  title: string;
  author: string;
  categories: CategoryResponse[];
  abstractSnippet: string;
  uploadedAt: string;
  publicationYear: number | null;
  viewCount: number;
  filePath: string;
  createdAt: string;
}

export type LibraryPage = PaginatedResponse<LibraryItem>;
