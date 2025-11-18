import { CategoryResponse } from './explore';

export interface UserProfile {
  id: string;
  fullName: string | null;
  affiliation: string | null;
  bio: string | null;
  website: string | null;
  avatarUrl: string | null;
  maskedEmail: string | null;
  totalPapers: number;
  totalViews: number;
  interests: CategoryResponse[];
}
