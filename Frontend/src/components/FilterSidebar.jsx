import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAllCategories } from '../services/api';
import CategoryComponent from './course/Category'; 
import Loader from '../components/common/Loader';
import Button from '../components/common/Button'; 

function FilterSidebar({ currentFilters, onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      try {
        const data = await getAllCategories();
        setCategories(data.categories);
      } catch (err) {
        setErrorCategories(err.message || "Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);


  useEffect(() => {
    setSelectedCategory(currentFilters.category || '');
    setMinPrice(currentFilters.minPrice || '');
    setMaxPrice(currentFilters.maxPrice || '');
  }, [currentFilters]);

  const handleApplyFilters = () => {
    const newFilters = {
      category: selectedCategory,
      minPrice: minPrice !== '' ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
    };

    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === '' || newFilters[key] === undefined || (typeof newFilters[key] === 'number' && isNaN(newFilters[key]))) {
        delete newFilters[key];
      }
    });
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({}); // Clear all filters
  };

  return (
    <div className="bg-background-card p-md rounded-lg shadow-md border border-gray-100 font-sans">
      <h2 className="text-2xl font-bold text-text-primary mb-lg border-b pb-sm">Filter Courses</h2>

      {/* Category Filter */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-md">Categories</h3>
        {loadingCategories ? (
          <Loader />
        ) : errorCategories ? (
          <p className="text-accent-error text-sm">{errorCategories}</p>
        ) : categories.length === 0 ? (
          <p className="text-text-secondary text-sm">No categories available.</p>
        ) : (
          <div className="grid grid-cols-2 gap-sm"> 
            {categories.map((cat) => (
              <CategoryComponent
                key={cat._id}
                category={cat}
                onClick={() => setSelectedCategory(prev => prev === cat._id ? '' : cat._id)} // Toggle selection
                isSelected={selectedCategory === cat._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-md">Price Range</h3>
        <div className="flex items-center space-x-sm">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 p-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <span className="text-text-secondary">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 p-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-sm">
        <Button text="Apply Filters" onClick={handleApplyFilters} className="w-full" />
        <Button text="Clear Filters" onClick={handleClearFilters} variant="outline" className="w-full" />
      </div>
    </div>
  );
}

FilterSidebar.propTypes = {
  currentFilters: PropTypes.object, 
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterSidebar;
