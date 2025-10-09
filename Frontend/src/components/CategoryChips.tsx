import React from 'react';
import { CategoryResponse } from '../types/explore';
import './CategoryChips.css';

interface CategoryChipsProps {
  categories: CategoryResponse[];
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ categories }) => {
  return (
    <div className="category-chips">
      {categories.map((category) => (
        <span key={category.id} className="category-chip">
          {category.name}
        </span>
      ))}
    </div>
  );
};

export default CategoryChips;
