import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg mx-auto mb-lg rounded-md overflow-hidden shadow-sm border border-gray-200">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for courses..."
        className="flex-grow p-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
      />
      <button
        type="submit"
        className="bg-primary-main text-white px-md py-sm hover:bg-primary-dark transition-colors duration-200"
      >
        Search
      </button>
    </form>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func,
};

export default SearchBar;
