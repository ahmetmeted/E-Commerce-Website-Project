import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';  // Correct import of jwtDecode
import { Footer, Navbar } from "../components";
import EditProduct from "./EditProduct"; // Import the EditProduct component

const StoreProduct = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // State for the product being edited

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const storeResponse = await fetch(`http://localhost:8000/api/store/`);
        const stores = await storeResponse.json();

        const token = localStorage.getItem('authToken');
        if (token) {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.user_id;

          const userStore = stores.find(store => store.owner === userId);
          const userStoreId = userStore ? userStore.id : null;

          if (userStoreId) {
            const productResponse = await fetch(`http://localhost:8000/api/product/`);
            const products = await productResponse.json();
            const filteredProducts = products.filter(product => product.store_id === userStoreId);
            setProducts(filteredProducts);
          } else {
            setProducts([]);
          }
        } else {
          const productResponse = await fetch(`http://localhost:8000/api/product/`);
          const products = await productResponse.json();
          setProducts(products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
      setLoading(false);
    };

    getProducts();
  }, []);

  const handleRemove = async (productId) => {
    const confirm = window.confirm("Are you sure you want to remove this product?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error("No token found, please log in first.");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/product/${productId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setProducts(products.filter(product => product.id !== productId));
        window.location.reload();
      } else {
        console.error("Failed to remove product:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to remove product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product); // Set the product to be edited
  };

  const handleEditClose = () => {
    setEditProduct(null); // Close the edit form
  };

  const Loading = () => {
    return (
      <div className="container my-5 py-2">
        <div className="row">
          <div className="col-md-6 py-3">
            <Skeleton height={400} width={400} />
          </div>
          <div className="col-md-6 py-5">
            <Skeleton height={30} width={250} />
            <Skeleton height={90} />
            <Skeleton height={40} width={70} />
            <Skeleton height={50} width={110} />
            <Skeleton height={120} />
            <Skeleton height={40} width={110} inline={true} />
            <Skeleton className="mx-3" height={40} width={110} />
          </div>
        </div>
      </div>
    );
  };

  const ShowProducts = () => {
    if (loading) return <Loading />;

    return (
      <div className="container my-5 py-2">
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-md-4 col-sm-6 py-3">
              <div className="card shadow-sm" style={cardStyle}>
                <img
                  className="card-img-top"
                  src={product.product_images}
                  alt={product.product_name}
                  style={imgStyle}
                />
                <div className="card-body">
                  <h5 className="card-title" style={titleStyle}>{product.product_name}</h5>
                  <p className="card-text" style={textStyle}>${product.product_price.toFixed(2)}</p>
                  <p className="card-text">{product.product_description}</p>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    style={removeButtonStyle}
                    onClick={() => handleRemove(product.id)}
                  >
                    Remove
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    style={editButtonStyle}
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const cardStyle = {
    transition: "transform 0.2s ease",
  };

  const imgStyle = {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderTopLeftRadius: "calc(0.25rem - 1px)",
    borderTopRightRadius: "calc(0.25rem - 1px)",
  };

  const titleStyle = {
    fontWeight: 700,
  };

  const textStyle = {
    color: "#6c757d",
  };

  const removeButtonStyle = {
    borderColor: "#dc3545",
    color: "#dc3545",
    marginRight: "10px",
  };

  const editButtonStyle = {
    borderColor: "#007bff",
    color: "#007bff",
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>
      {editProduct && <EditProduct product={editProduct} onClose={handleEditClose} />}
      <Footer />
    </>
  );
};

export default StoreProduct;
