import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/explore/SearchBar';
import FilterSidebar from '../components/explore/FilterSidebar';
import PaperGrid from '../components/explore/PaperGrid';
import { useExplore } from '../hooks/useExplore';
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

  const {
    papers,
    loading,
    error,
    hasMore,
    loadMore,
    searchPapers,
    resetSearch
  } = useExplore();

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

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
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
            value={filters.query}
            onChange={handleSearch}
            placeholder="Search papers, authors, or topics..."
          />
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
