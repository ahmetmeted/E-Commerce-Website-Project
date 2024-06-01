import React, { useState } from 'react';
import { Footer, Navbar, Product, SearchBar } from "../components";

const Products = () => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  return (
    <>
      <Navbar />
      <Product searchResults={searchResults} />
      <Footer />
    </>
  );
};

export default Products;
