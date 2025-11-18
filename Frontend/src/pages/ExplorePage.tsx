import React, { useState, useEffect, useRef } from 'react';
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

type ExploreTab = 'recommended' | 'trending' | 'search';

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
  const [activeTab, setActiveTab] = useState<ExploreTab>('recommended');
  const skipFilterEffectRef = useRef(false);

  const {
    papers,
    loading,
    error,
    hasMore,
    loadMore,
    searchPapers,
    loadTrendingPapers,
    resetSearch
  } = useExplore();

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
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
    if (skipFilterEffectRef.current) {
      skipFilterEffectRef.current = false;
      return;
    }

    if (activeTab === 'trending') {
      return;
    }

    const hasActiveFilters = filters.query || filters.categories.length > 0 || filters.year || filters.author;
    
    if (hasActiveFilters) {
      if (activeTab !== 'search') {
        setActiveTab('search');
      }
      searchPapers(filters);
    } else {
      if (activeTab !== 'recommended') {
        setActiveTab('recommended');
      }
      resetSearch();
    }
  }, [filters, activeTab, searchPapers, resetSearch]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleFilterChange = (newFilters: Partial<ExploreFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setActiveTab('recommended');
    setFilters({
      query: '',
      categories: [],
      year: null,
      author: ''
    });
  };

  const handleTabChange = (tab: ExploreTab) => {
    if (tab === 'trending') {
      setActiveTab('trending');
      void loadTrendingPapers();
      return;
    }

    if (tab === 'recommended') {
      const hasActiveFilters = filters.query || filters.categories.length > 0 || filters.year || filters.author;
      if (hasActiveFilters) {
        handleClearFilters();
        return;
      }
      skipFilterEffectRef.current = true;
      setActiveTab('recommended');
      resetSearch();
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const gridTitle = activeTab === 'trending'
    ? 'Trending Papers'
    : activeTab === 'search'
      ? 'Search Results'
      : 'Recommended for You';

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
          <div className="explore-tabs">
            <button
              className={`explore-tab ${activeTab === 'recommended' ? 'active' : ''}`}
              onClick={() => handleTabChange('recommended')}
            >
              Recommended
            </button>
            <button
              className={`explore-tab ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={() => handleTabChange('trending')}
            >
              Trending
            </button>
          </div>
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
              isSearching={activeTab === 'search'}
              title={gridTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
