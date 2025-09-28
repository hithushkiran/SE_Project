import React, { useState } from 'react';
import { CategoryResponse, ExploreFilters } from '../../types/explore';
import './FilterSidebar.css';

interface FilterSidebarProps {
  isOpen: boolean;
  categories: CategoryResponse[];
  filters: ExploreFilters;
  onFilterChange: (filters: Partial<ExploreFilters>) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  categories,
  filters,
  onFilterChange,
  onClearFilters,
  onClose
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    year: true,
    author: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    onFilterChange({ categories: newCategories });
  };

  const handleYearChange = (year: number | null) => {
    onFilterChange({ year });
  };

  const handleAuthorChange = (author: string) => {
    onFilterChange({ author });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.year !== null || 
    filters.author !== '';

  if (!isOpen) return null;

  return (
    <div className="filter-sidebar-overlay" onClick={onClose}>
      <div className="filter-sidebar" onClick={e => e.stopPropagation()}>
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="filter-content">
          {/* Categories Filter */}
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('categories')}
            >
              <h4>Categories</h4>
              <span className={`expand-icon ${expandedSections.categories ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.categories && (
              <div className="filter-section-content">
                {categories.length === 0 ? (
                  <div className="loading-text">Loading categories...</div>
                ) : (
                  <div className="category-list">
                    {categories.map(category => (
                      <label key={category.id} className="category-item">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                        />
                        <span className="category-name">{category.name}</span>
                        {category.description && (
                          <span className="category-description">
                            {category.description}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Year Filter */}
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('year')}
            >
              <h4>Publication Year</h4>
              <span className={`expand-icon ${expandedSections.year ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.year && (
              <div className="filter-section-content">
                <div className="year-options">
                  <label className="year-item">
                    <input
                      type="radio"
                      name="year"
                      checked={filters.year === null}
                      onChange={() => handleYearChange(null)}
                    />
                    <span>Any Year</span>
                  </label>
                  {yearOptions.map(year => (
                    <label key={year} className="year-item">
                      <input
                        type="radio"
                        name="year"
                        checked={filters.year === year}
                        onChange={() => handleYearChange(year)}
                      />
                      <span>{year}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Author Filter */}
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('author')}
            >
              <h4>Author</h4>
              <span className={`expand-icon ${expandedSections.author ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.author && (
              <div className="filter-section-content">
                <input
                  type="text"
                  placeholder="Search by author name..."
                  value={filters.author}
                  onChange={(e) => handleAuthorChange(e.target.value)}
                  className="author-input"
                />
              </div>
            )}
          </div>
        </div>

        <div className="filter-footer">
          {hasActiveFilters && (
            <button className="clear-filters-button" onClick={onClearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
