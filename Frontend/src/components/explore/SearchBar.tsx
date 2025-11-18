import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  aiSearchEnabled?: boolean;
  onAiSearchToggle?: (enabled: boolean) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  suggestions = [],
  onSuggestionSelect,
  aiSearchEnabled = false,
  onAiSearchToggle,
  isLoading = false
}) => {
  const effectivePlaceholder = aiSearchEnabled 
    ? "Try: 'machine learning papers from 2023' or 'AI research by John Smith'" 
    : placeholder;
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (value.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setFocusedIndex(-1);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[focusedIndex]);
      } else {
        onSearch();
      }
      return;
    }

    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="search-bar-container">
      {onAiSearchToggle && (
        <div className="ai-search-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={aiSearchEnabled}
              onChange={(e) => onAiSearchToggle(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-switch"></span>
            <span className="toggle-text">
              ✨ Natural Language AI Search
            </span>
          </label>
          {aiSearchEnabled && (
            <div className="ai-hint">
              Try queries like "machine learning papers from 2023" or "research by John Doe"
            </div>
          )}
        </div>
      )}
      
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={effectivePlaceholder}
          className="search-input"
          disabled={isLoading}
        />
        <div className="search-icon">🔍</div>
        
        {isLoading && (
          <div className="search-loading">
            <div className="spinner"></div>
            <span>AI is thinking...</span>
          </div>
        )}
        
        {value && !isLoading && (
          <button
            className="clear-button"
            onClick={() => onChange('')}
            type="button"
          >
            ✕
          </button>
        )}
        
        {onSearch && !isLoading && (
          <button 
            onClick={onSearch}
            className="search-button"
            type="button"
          >
            Search
          </button>
        )}
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div ref={suggestionsRef} className="suggestions-dropdown">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${
                index === focusedIndex ? 'focused' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
