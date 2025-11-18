import { useState } from 'react';
import { parseSearchQueryWithGemini, ParsedSearchQuery } from '../services/geminiService';
import { api } from '../api/axios';

interface Category {
  id: string;
  name: string;
}

interface AiSearchResult {
  papers: any[];
  totalPages: number;
  totalElements: number;
  parsedQuery: ParsedSearchQuery;
}

export const useAiSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery | null>(null);

  /**
   * Fetch available categories from backend
   */
  const fetchCategories = async (): Promise<Category[]> => {
    try {
      const response = await api.get('categories');
      
      // Handle different response formats
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      return [];
    }
  };

  /**
   * Convert category names to UUIDs
   */
  const getCategoryIds = (categoryNames: string[], allCategories: Category[]): string[] => {
    if (!categoryNames || categoryNames.length === 0) return [];
    
    return allCategories
      .filter(cat => 
        categoryNames.some(name => 
          cat.name.toLowerCase() === name.toLowerCase()
        )
      )
      .map(cat => cat.id);
  };

  /**
   * Perform AI-powered search
   */
  const searchWithAi = async (userQuery: string): Promise<AiSearchResult> => {
    setLoading(true);
    setError(null);
    setParsedQuery(null);

    try {
      console.log('Starting AI search for query:', userQuery);

      // 1. Fetch available categories
      const categories = await fetchCategories();
      const categoryNames = categories.map(c => c.name);

      console.log('Fetched categories:', categoryNames);

      if (categoryNames.length === 0) {
        console.warn('No categories found in database');
      }

      // 2. Parse query with Gemini AI
      const parsed = await parseSearchQueryWithGemini(userQuery, categoryNames);
      setParsedQuery(parsed);

      console.log('AI Parsed Query:', parsed);

      // 3. Convert category names to UUIDs
      const categoryIds = parsed.categories 
        ? getCategoryIds(parsed.categories, categories)
        : [];

      console.log('Mapped category IDs:', categoryIds);

      // 4. Build query parameters for existing explore endpoint
      const params = new URLSearchParams();
      
      if (parsed.query) params.append('query', parsed.query);
      if (categoryIds.length > 0) {
        categoryIds.forEach(id => params.append('categories', id));
      }
      if (parsed.year) params.append('year', parsed.year.toString());
      if (parsed.author) params.append('author', parsed.author);
      
      params.append('page', '0');
      params.append('size', '20');

      console.log('Calling explore endpoint with params:', params.toString());

      // 5. Call existing explore endpoint with parsed filters
      const response = await api.get(`/explore?${params.toString()}`);

      console.log('Explore API response:', response.data);

      if (response.data.success) {
        return {
          papers: response.data.data.content || [],
          totalPages: response.data.data.totalPages || 0,
          totalElements: response.data.data.totalElements || 0,
          parsedQuery: parsed
        };
      } else {
        throw new Error(response.data.message || 'Search failed');
      }

    } catch (err: any) {
      // Extract meaningful error message from backend or Axios error
      let errorMessage = 'AI search failed. Please try regular search.';
      
      if (err.response?.data?.message) {
        // Backend returned an error message
        errorMessage = `Search error: ${err.response.data.message}`;
      } else if (err.response?.status) {
        // HTTP error without custom message
        errorMessage = `Search failed with status ${err.response.status}`;
      } else if (err.message) {
        // Generic error (network, parsing, etc.)
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('AI Search Error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchWithAi,
    loading,
    error,
    parsedQuery
  };
};
