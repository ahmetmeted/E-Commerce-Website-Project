import React, { useState } from 'react';
import { Footer, Navbar } from "../components";
import { useNavigate } from 'react-router-dom';

const ProductAdd = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('authToken');
    const storeId = localStorage.getItem('store_id');

    console.log("Token:", token);
    console.log("Store ID:", storeId);

    if (!token || !storeId) {
      setError('You must be logged in to add a product.');
      return;
    }

    if (productPrice < 0) {
      setError('Product price cannot be less than 0.');
      return;
    }

    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('product_price', productPrice);
    formData.append('product_description', productDescription);
    formData.append('store_id', storeId);
    if (productImage) {
      formData.append('product_images', productImage);
    }

    try {
      const response = await fetch(`http://localhost:8000/api/product/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Product added:', data);
      setSuccess('Product added successfully.');
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error:', error.message);
      setError('Failed to add product. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Add Product</h1>
        <hr />
        <div className="row my-4 h-100">
          <div className="col-md-6 col-lg-6 col-sm-8 mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="my-3">
                <label htmlFor="productName">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="productName"
                  placeholder="Product Name"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                />
              </div>
              <div className="my-3">
                <label htmlFor="productPrice">Product Price</label>
                <input
                  type="number"
                  className="form-control"
                  id="productPrice"
                  placeholder="Product Price"
                  value={productPrice}
                  onChange={e => setProductPrice(e.target.value)}
                />
              </div>
              <div className="my-3">
                <label htmlFor="productDescription">Product Description</label>
                <textarea
                  className="form-control"
                  id="productDescription"
                  placeholder="Product Description"
                  value={productDescription}
                  onChange={e => setProductDescription(e.target.value)}
                />
              </div>
              <div className="my-3">
                <label htmlFor="productImage">Product Image</label>
                <input
                  type="file"
                  className="form-control"
                  id="productImage"
                  onChange={e => setProductImage(e.target.files[0])}
                />
              </div>
              <div className="text-center">
                <button className="btn btn-dark" type="submit">
                  Add Product
                </button>
              </div>
              {error && <div className="text-danger text-center mt-3">{error}</div>}
              {success && <div className="text-success text-center mt-3">{success}</div>}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductAdd;
