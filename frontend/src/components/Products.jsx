import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar"; // Assuming the path to SearchBar component is correct

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const authToken = localStorage.getItem('authToken');
  let componentMounted = true;
  const dispatch = useDispatch();

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/product/");
      if (componentMounted) {
        const products = await response.json();

        // Fetch store names for each product
        const productsWithStoreName = await Promise.all(products.map(async product => {
          const storeResponse = await fetch(`http://localhost:8000/api/store/${product.store_id}`);
          const store = await storeResponse.json();
          return { ...product, store_name: store.store_name };
        }));

        setData(productsWithStoreName);
        setFilter(productsWithStoreName);
        setLoading(false);
      }

      return () => {
        componentMounted = false;
      };
    };

    getProducts();
  }, []);

  // Function to handle adding a product to the cart
  const addToCart = async (productId, quantity = 1) => {
    const response = await fetch(`http://localhost:8000/api/add-to-basket/${productId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ quantity })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Product added to cart:', data);
      dispatch(addCart(data));  // Dispatch the action to update the cart
    } else {
      console.error('Failed to add product to cart:', data);
    }
  };

  // Function to handle search results
  const handleSearch = (results) => {
    console.log('Search results:', results); // Log the search results to verify the product data
    setFilter(results);
  };

  // Function to reset search results
  const handleClearSearch = () => {
    setFilter(data);
  };

  const handleError = (event) => {
    event.target.src = "https://via.placeholder.com/300"; // Fallback image URL
  };

  const constructImageUrl = (path) => {
    const baseUrl = "http://localhost:8000/media/"; // Base URL of your media directory
    return path.startsWith("http") ? path : `${baseUrl}${path}`;
  };

  const Loading = () => {
    return (
      <>
        <div className="col-12 py-5 text-center">
          <Skeleton height={40} width={560} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      </>
    );
  };

  const ShowProducts = () => {
    return (
      <>
        <div className="row">
          {filter.map((product) => (
            <div id={product.id} key={product.id} className="col-md-4 col-sm-6 col-xs-12 mb-4">
              <div className="card text-center h-100">
                <img
                  className="card-img-top p-3"
                  src={constructImageUrl(product.product_images)}
                  alt={product.product_name}
                  height={300}
                  onError={handleError}
                  onLoad={() => console.log(`Loaded image: ${constructImageUrl(product.product_images)}`)}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.product_name}</h5>
                  <p className="card-text">{product.product_description}</p>
                  <p className="card-text">{product.store_name}</p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item lead">$ {product.product_price.toFixed(2)}</li>
                </ul>
                <div className="card-body">
                  <Link to={`/product/${product.id}`} className="btn btn-dark m-1">
                    Product Details
                  </Link>
                  <button
                    className="btn btn-dark m-1"
                    onClick={() => addToCart(product.id)}
                    disabled={!authToken}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="container my-3 py-3">
      <div className="row">
        <div className="col-12">
          <h2 className="display-5 text-center">Products</h2>
          <hr />
        </div>
      </div>
      <SearchBar onSearch={handleSearch} onClearSearch={handleClearSearch} />
      <div className="row justify-content-center">
        {loading ? <Loading /> : <ShowProducts />}
      </div>
    </div>
  );
};

export default Products;
