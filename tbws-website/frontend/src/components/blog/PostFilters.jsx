import React from 'react';
import { Search, X } from 'lucide-react';
import './PostFilters.css';

const PostFilters = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  postType,
  setPostType
}) => {
  const postTypes = [
    { value: '', label: 'All Types' },
    { value: 'news', label: 'News' },
    { value: 'blog', label: 'Blog' },
    { value: 'announcement', label: 'Announcements' },
  ];

  return (
    <div className="post-filters">
      {/* Search */}
      <div className="filter-search">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="search-clear"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Post Type Filter */}
      <div className="filter-group">
        <label className="filter-label">Type:</label>
        <div className="filter-buttons">
          {postTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setPostType(type.value)}
              className={`filter-btn ${postType === type.value ? 'filter-btn-active' : ''}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <div className="filter-buttons">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`filter-btn ${!selectedCategory ? 'filter-btn-active' : ''}`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`filter-btn ${selectedCategory === category.id ? 'filter-btn-active' : ''}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFilters;