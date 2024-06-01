import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Footer, Navbar } from "../components";

const Cart = () => {
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();
  const [basketItems, setBasketItems] = useState([]);
  const authToken = localStorage.getItem('authToken');
  const username = localStorage.getItem('user_name');
  const currentUserId = localStorage.getItem('user_id');



  useEffect(() => {
    fetchBasketItems();
  }, []);

  const fetchBasketItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/basket/');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const basketData = await response.json();

      // Filter basket items that belong to the logged-in user
      const userBasketItems = basketData.filter(item => item.user.toString() === currentUserId);
  
      const itemsWithProductDetails = await Promise.all(userBasketItems.map(async item => {
        const productResponse = await fetch(`http://localhost:8000/api/product/${item.product}/`);
        if (!productResponse.ok) {
          throw new Error(`HTTP error! Status: ${productResponse.status}`);
        }
        const productData = await productResponse.json();
        console.log('Product data for item', item.product, ':', productData); // Debug log for each product data
  
        // Adjust these fields according to your API response
        return {
          ...item,
          price: productData.product_price, // Adjusted from 'price' to 'product_price'
          image: productData.product_images, // Adjusted from 'image' to 'product_images'
          product_name: productData.product_name // Adjusted from 'title' to 'product_name'
        };
      }));
  
      console.log('Items with product details:', itemsWithProductDetails); // Final debug log
      setBasketItems(itemsWithProductDetails);
    } catch (error) {
      console.error('Error fetching basket items:', error);
    }
  };
  

      // Function to handle adding a product to the cart
      const addToCart = async (productId, quantity = 1) => {
        const response = await fetch(`http://localhost:8000/api/add-to-basket/${productId}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include the Authorization header with your Bearer token
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ quantity })
        });
    
        if (response.ok) {
          fetchBasketItems(); // Fetch the updated basket items
          // Optionally, update Redux store or show notification
        } else {
        }
    };

    const clearTheCart = async (productId) => {
      const response = await fetch(`http://localhost:8000/api/remove-from-basket/${productId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include the Authorization header with your Bearer token
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify()
      });
  
      if (response.ok) {
        fetchBasketItems(); // Fetch the updated basket items
        // Optionally, update Redux store or show notification
      } else {
      }
  };

  const deleteToCart = async (productId, quantity = 1) => {
    const response = await fetch(`http://localhost:8000/api/decrease-from-basket/${productId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include the Authorization header with your Bearer token
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ quantity })
    });

    if (response.ok) {
      fetchBasketItems(); // Fetch the updated basket items
      // Optionally, update Redux store or show notification
    } else {
    }
};

const clearAllItems = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/clear-basket/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include the Authorization header with your Bearer token
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (response.ok) {
      fetchBasketItems(); // Fetch the updated basket items
      // Optionally, update Redux store or show notification
    } else {
    }
  } catch (error) {
    console.error('Error clearing all items:', error);
  }
};
  
  

  const EmptyCart = () => (
    <div className="container">
      <div className="row">
        <div className="col-md-12 py-5 bg-light text-center">
          <h4 className="p-3 display-5">Your Cart is Empty</h4>
          <Link to="/product" className="btn btn-outline-dark mx-4">
            <i className="fa fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );

  const ShowCart = () => {
    if (basketItems.length === 0) return <EmptyCart />;
    
    let subtotal = basketItems.reduce((total, item) => total + item.price * item.quantity, 0);
    let shipping = 30.0;  // Static shipping cost
    let totalItems = basketItems.reduce((total, item) => total + item.quantity, 0);

    console.log('Basket items:', basketItems); // Debug log

    return (
      <>
        <section className="h-100 gradient-custom">
          <div className="container py-5">
            <div className="row d-flex justify-content-center my-4">
              <div className="col-md-8">
                <div className="card mb-4">
                  <div className="card-header py-3">
                    <h5 className="mb-0">Item List</h5>
                  </div>
                  <div className="card-body">
                    {basketItems.map((item) => (
                      <div key={item.id}>
                        <div className="row d-flex align-items-center">
                          <div className="col-lg-3 col-md-12">
                            <div className="bg-image rounded" data-mdb-ripple-color="light">

                              <img src={item.image} alt={item.product_name} width={100} height={75} />
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-">
                            <p><strong>{item.product_name}</strong></p>
                          </div>
                          <div className="col-lg-4 col-md-6">
                            <div className="d-flex mb-4" style={{ maxWidth: "300px" }}>

                            <button
                              className="btn px-"
                              onClick={() => deleteToCart(item.product, 1)} // Assuming item.product is the productId
                            >
                              <i className="fas fa-minus"></i>
                            </button>

                            <p className="mx-4">{item.quantity}</p>

                            <button
                              className="btn px-3"
                              onClick={() => addToCart(item.product, 1)} // Assuming item.product is the productId
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                            

                            <button className="btn  btn-danger" onClick={() => clearTheCart(item.product)}>
                              Clear Item
                            </button>

                            </div>
                            <p className="text-start text-md-center">
                              <strong><span className="text-muted">{item.quantity}</span> x ${item.price}</strong>
                            </p>
                          </div>
                        </div>
                        <hr className="my-4" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-header py-3 bg-light">
                    <h5 className="mb-0">Order Summary</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                        Products ({totalItems})<span>${Math.round(subtotal)}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                        Shipping<span>${shipping}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
                        <div><strong>Total amount</strong></div>
                        <span><strong>${Math.round(subtotal + shipping)}</strong></span>
                      </li>
                    </ul>
                    <Link to="/checkout" className="btn btn-dark btn-lg btn-block">
                      Go to checkout
                    </Link>

                    <button className="btn  btn-danger btn-lng btn-block" onClick={() => clearAllItems()} >
                              Clear Cart
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Cart</h1>
        <hr />
        {basketItems.length > 0 ? <ShowCart /> : <EmptyCart />}
      </div>
      <Footer />
    </>
  );
};

export default Cart;
