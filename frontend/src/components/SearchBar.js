import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, onClearSearch }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const fetchSearchResults = async () => {
        if (query === '') {
          onClearSearch();
        } else {
          try {
            const response = await fetch(`http://localhost:8000/api/product/search/?query=${query}`);
            const data = await response.json();
            onSearch(data); // Pass search results to the parent component
          } catch (error) {
            console.error('Error fetching products:', error);
          }
        }
      };

      fetchSearchResults();
    }, 500); // Debounce delay of 500ms

    return () => clearTimeout(debounceTimeout);
  }, [query, onSearch, onClearSearch]);

  return (
    <div className="search-container">
      <style>
        {`
          .search-container {
            width: 100%;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: all 0.3s ease;
          }

          .search-container:hover {
            box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15);
          }

          .search-form {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
          }

          .search-input {
            width: 70%;
            padding: 12px 20px;
            border: 2px solid #007BFF;
            border-radius: 30px;
            font-size: 16px;
            transition: border-color 0.3s ease, background-color 0.3s ease;
          }

          .search-input:focus {
            border-color: #0056b3;
            background-color: #f0f8ff;
            outline: none;
          }

          .search-button {
            padding: 12px 20px;
            border: none;
            background-color: #007BFF;
            color: white;
            border-radius: 30px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease, transform 0.3s ease;
          }

          .search-button:hover {
            background-color: #0056b3;
            transform: scale(1.05);
          }
        `}
      </style>
      <form onSubmit={(e) => e.preventDefault()} className="search-form">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search for products..." 
          className="search-input"
        />
      </form>
    </div>
  );
};

export default SearchBar;
