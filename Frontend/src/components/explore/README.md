# Explore Page Components

This directory contains all the components for the ResearchHub Explore page functionality.

## Components

### ExplorePage.tsx
Main page component that orchestrates the entire explore experience. Handles:
- State management for filters and search
- Integration with the useExplore hook
- Layout and navigation

### SearchBar.tsx
Search input component with real-time suggestions. Features:
- Debounced search input
- Keyboard navigation (arrow keys, enter, escape)
- Click outside to close suggestions
- Clear button functionality

### FilterSidebar.tsx
Collapsible sidebar with filtering options:
- Category multi-select with checkboxes
- Year range selector (last 10 years)
- Author search input
- Clear all filters functionality
- Mobile-responsive overlay design

### PaperGrid.tsx
Grid layout for displaying papers with:
- Loading states and error handling
- Empty state messages
- Load more functionality
- Responsive grid layout

### PaperCard.tsx
Individual paper card component displaying:
- Paper title, author, and abstract snippet
- Publication year and upload date
- Category tags
- Download button (placeholder)
- Hover effects and animations

## Hooks

### useExplore.ts
Custom hook for API integration:
- Search papers with filters
- Load more pagination
- Reset to recommended papers
- Error handling and loading states
- Request cancellation for performance

## Styling

All components use CSS modules with:
- Consistent color scheme matching the app theme
- Responsive design for mobile devices
- Smooth animations and transitions
- Accessible hover and focus states

## API Integration

The explore functionality integrates with these backend endpoints:
- `GET /api/explore` - Main search and recommendations
- `GET /api/categories` - Available categories for filtering

## Usage

```tsx
import ExplorePage from '../pages/ExplorePage';

// In your router
<Route path="/explore" element={<ExplorePage />} />
```

The explore page is accessible via the "Explore papers" card on the dashboard.
