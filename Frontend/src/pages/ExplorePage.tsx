import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/explore/SearchBar';
import FilterSidebar from '../components/explore/FilterSidebar';
import PaperGrid from '../components/explore/PaperGrid';
import AiUnderstanding from '../components/explore/AiUnderstanding';
import { useExplore } from '../hooks/useExplore';
import { useAiSearch } from '../hooks/useAiSearch';
import { CategoryResponse } from '../types/explore';
import './ExplorePage.css';
import { api } from '../services/api';

interface ExploreFilters {
  query: string;
  categories: string[];
  year: number | null;
  author: string;
}

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ExploreFilters>({
    query: '',
    categories: [],
    year: null,
    author: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  
  // AI Search State
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    papers,
    loading,
    error,
    hasMore,
    loadMore,
    searchPapers,
    resetSearch
  } = useExplore();

  // AI Search Hook
  const { 
    searchWithAi, 
    loading: aiLoading, 
    error: aiError, 
    parsedQuery 
  } = useAiSearch();

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('categories');
        if (res.data.success) {
          setCategories(res.data.data);
        } else {
          console.error('Categories API returned error shape:', res.data);
        }
      } catch (error: any) {
        console.error('Failed to load categories:', error?.response?.data || error.message);
      }
    };
    loadCategories();
  }, []);

  // Search papers when filters change
  useEffect(() => {
    const hasActiveFilters = filters.query || filters.categories.length > 0 || filters.year || filters.author;
    
    if (hasActiveFilters) {
      searchPapers(filters);
    } else {
      resetSearch();
    }
  }, [filters, searchPapers, resetSearch]);

  /**
   * Handle AI Search
   */
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      console.log('Initiating AI search with query:', searchQuery);
      const result = await searchWithAi(searchQuery);
      
      console.log('AI Search successful, found papers:', result.papers.length);
      console.log('Parsed query:', result.parsedQuery);
      
      // Convert AI result to filters and update UI
      // This ensures the papers display properly through useExplore
      const parsed = result.parsedQuery;
      const categoryUUIDs: string[] = [];
      
      // Map category names to UUIDs
      if (parsed.categories && categories.length > 0) {
        parsed.categories.forEach(catName => {
          const found = categories.find(c => 
            c.name.toLowerCase() === catName.toLowerCase()
          );
          if (found) {
            categoryUUIDs.push(found.id);
          }
        });
      }
      
      // Update filters which will trigger search through useExplore
      setFilters({
        query: parsed.query || '',
        categories: categoryUUIDs,
        year: parsed.year || null,
        author: parsed.author || ''
      });
      
    } catch (err: any) {
      console.error('AI search failed:', err);
      
      // Show error to user without alert (uses the error box in UI)
      // Fallback to regular keyword search
      setFilters(prev => ({ ...prev, query: searchQuery }));
    }
  };

  /**
   * Handle Regular Search
   */
  const handleRegularSearch = () => {
    setFilters(prev => ({ ...prev, query: searchQuery }));
  };

  /**
   * Unified search handler - routes to AI or regular search
   */
  const handleSearch = () => {
    if (aiSearchEnabled) {
      handleAiSearch();
    } else {
      handleRegularSearch();
    }
  };

  /**
   * Handle search query input change
   */
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    // For regular search, update filters in real-time
    if (!aiSearchEnabled) {
      setFilters(prev => ({ ...prev, query }));
    }
  };

  const handleFilterChange = (newFilters: Partial<ExploreFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      categories: [],
      year: null,
      author: ''
    });
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="explore-page">
      {/* Header */}
      <div className="explore-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
          <h1>Explore Research Papers</h1>
          <p>Discover trending research and academic papers</p>
        </div>
      </div>

      <div className="explore-content">
        {/* Search Bar */}
        <div className="search-section">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchQueryChange}
            onSearch={handleSearch}
            placeholder="Search papers, authors, or topics..."
            aiSearchEnabled={aiSearchEnabled}
            onAiSearchToggle={setAiSearchEnabled}
            isLoading={aiLoading}
          />
          
          {/* Show AI Understanding Box */}
          {aiSearchEnabled && parsedQuery && (
            <AiUnderstanding
              keywords={parsedQuery.query}
              categories={parsedQuery.categories}
              author={parsedQuery.author}
              year={parsedQuery.year}
            />
          )}
          
          {/* Show AI Error */}
          {aiError && (
            <div className="ai-error-box">
              <span>⚠️ {aiError}</span>
            </div>
          )}
          
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters
          </button>
        </div>

        <div className="explore-main">
          {/* Filter Sidebar */}
          <FilterSidebar
            isOpen={showFilters}
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onClose={() => setShowFilters(false)}
          />

          {/* Main Content */}
          <div className="main-content">
            <PaperGrid
              papers={papers}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={loadMore}
              isSearching={filters.query !== '' || filters.categories.length > 0 || filters.year !== null || filters.author !== ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
