import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer, Navbar } from '../components';

const OrderDetails = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [address, setAddress] = useState({ name: '', street: '', city: '', zip: '', country: '' });
  const [paymentDetails, setPaymentDetails] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
  const [errorMessage, setErrorMessage] = useState("");
  const authToken = localStorage.getItem('authToken');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  useEffect(() => {
    if (authToken) {
      fetchOrderItems();
    }
  }, [authToken]);

  const fetchOrderItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/basket/');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const basketData = await response.json();
      const userBasketData = basketData.filter(item => item.user.toString() === userId);

      const itemsWithProductDetails = await Promise.all(userBasketData.map(async item => {
        const productResponse = await fetch(`http://localhost:8000/api/product/${item.product}/`);
        if (!productResponse.ok) {
          throw new Error(`HTTP error! Status: ${productResponse.status}`);
        }
        const productData = await productResponse.json();
        return {
          ...item,
          price: productData.product_price,
          image: productData.product_images,
          product_name: productData.product_name
        };
      }));
      setOrderItems(itemsWithProductDetails);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const clearAllItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/clear-basket/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        fetchOrderItems();
      }
    } catch (error) {
      console.error('Error clearing all items:', error);
    }
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePaymentDetailsChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const isCreditCardValid = () => {
    const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
    let sum = 0;
    let doubleUp = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);

      if (doubleUp) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      doubleUp = !doubleUp;
    }

    if (sum % 10 === 0) {
      const currentDate = new Date();
      const expiryDateParts = paymentDetails.expiry.split('/');
      const expiryMonth = parseInt(expiryDateParts[0], 10);
      const expiryYear = parseInt('20' + expiryDateParts[1], 10); // Adjust to ensure four-digit year

      if (
        expiryMonth >= 1 &&
        expiryMonth <= 12 &&
        (expiryYear > currentDate.getFullYear() ||
          (expiryYear === currentDate.getFullYear() && expiryMonth > currentDate.getMonth() + 1))
      ) {
        const cvvRegex = /^[0-9]{3,4}$/;
        return cvvRegex.test(paymentDetails.cvv);
      }
    }

    return false;
  };

  const checkCartInformation = () => {
    const isNotEmptyOrWhitespace = (value) => value.trim().length > 0;
    const isValidZipCode = (value) => /^\d+$/.test(value);

    if (!authToken) {
      setErrorMessage('User not authenticated. Please log in.');
      return false;
    }
    if (orderItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return false;
    }
    for (const item of orderItems) {
      if (!item.product_name || !item.price || item.quantity <= 0) {
        setErrorMessage('Invalid item details in cart.');
        return false;
      }
    }
    if (!isNotEmptyOrWhitespace(address.name) || !isNotEmptyOrWhitespace(address.street) || !isNotEmptyOrWhitespace(address.city) || !isValidZipCode(address.zip) || !isNotEmptyOrWhitespace(address.country)) {
      setErrorMessage('Incomplete or invalid address details.');
      return false;
    }
    if (!isNotEmptyOrWhitespace(paymentDetails.cardName) || !isNotEmptyOrWhitespace(paymentDetails.cardNumber) || !isNotEmptyOrWhitespace(paymentDetails.expiry) || !isNotEmptyOrWhitespace(paymentDetails.cvv)) {
      setErrorMessage('Incomplete payment details.');
      return false;
    }
    if (!isCreditCardValid()) {
      setErrorMessage('Invalid credit card details.');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!checkCartInformation()) {
      console.error('Cart information is invalid');
      return;
    }

    const orderTotalPrice = orderItems.reduce((total, item) => total + item.price * item.quantity, 0) + 30.0;
    const orderDetails = {
      email: email,
      item_name: orderItems.map(item => item.product_name).join(", "),
      item_quantity: orderItems.map(item => item.quantity).join(", "),
      order_address: `${address.street}, ${address.city}, ${address.zip}, ${address.country}`,
      order_total_price: orderTotalPrice
    };

    try {
      const response = await fetch('http://localhost:8000/api/send-order-details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(orderDetails)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log("Order submitted successfully!");

      console.log("Item Name : " + orderDetails.item_name);
      console.log("Item Quantity : " + orderDetails.item_quantity);
      console.log("Order Address : " + orderDetails.order_address);
      console.log("Order Total Price : " + orderDetails.order_total_price);
      
      console.log("Auth Token : " + authToken);
      console.log("Auth Token : " + authToken);
      console.log("Auth Token : " + authToken);
      console.log("Auth Token : " + authToken);
      console.log("Auth Token : " + authToken);
      

      // Add to PurchaseHistory
      const historyResponse = await fetch('http://localhost:8000/api/purchase-history/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          owner: userId,
          item_name: orderDetails.item_name,
          item_quantity: orderDetails.item_quantity,
          order_address: orderDetails.order_address,
          order_total_price: orderDetails.order_total_price
        })
      });

      if (!historyResponse.ok) {
        throw new Error(`HTTP error! Status: ${historyResponse.status}`);
      }

      console.log("Purchase history added successfully!");
      navigate('/');
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrorMessage('Error processing payment');
    }

    clearAllItems();
  };


  let subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  let shipping = 30.0;
  let totalItems = orderItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Order Details</h1>
        <hr />
        <section className="h-100 gradient-custom">
          <div className="container py-5">
            <div className="row d-flex justify-content-center my-4">
              <div className="col-md-8">
                <div className="card mb-4">
                  <div className="card-header py-3">
                    <h5 className="mb-0">Item List</h5>
                  </div>
                  <div className="card-body">
                    {orderItems.map((item) => (
                      <div key={item.id}>
                        <div className="row d-flex align-items-center">
                          <div className="col-lg-3 col-md-12">
                            <div className="bg-image rounded">
                              <img src={item.image} alt={item.product_name} width={100} height={75} />
                            </div>
                          </div>
                          <div className="col-lg-9 col-md-12">
                            <p><strong>{item.product_name}</strong></p>
                            <p><strong>{item.quantity}</strong> x ${item.price}</p>
                          </div>
                        </div>
                        <hr className="my-4" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card mb-4" style={{ padding: '20px', background: '#f7f7f7', borderRadius: '8px' }}>
                  <h5 className="mb-4">Shipping Address</h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <input type="text" placeholder="Name" name="name" value={address.name} onChange={handleAddressChange} style={{ width: '48%' }} />
                    <input type="text" placeholder="Country" name="country" value={address.country} onChange={handleAddressChange} style={{ width: '48%' }} />
                  </div>
                  <input type="text" placeholder="Street" name="street" value={address.street} onChange={handleAddressChange} style={{ width: '100%', marginBottom: '10px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <input type="text" placeholder="City" name="city" value={address.city} onChange={handleAddressChange} style={{ width: '48%' }} />
                    <input type="text" placeholder="ZIP Code" name="zip" value={address.zip} onChange={handleAddressChange} style={{ width: '48%' }} />
                  </div>
                  <hr />
                  <h5 className="mb-4">Payment Details</h5>
                  <input type="text" placeholder="Card Name" name="cardName" value={paymentDetails.cardName} onChange={handlePaymentDetailsChange} style={{ width: '100%', marginBottom: '10px' }} />
                  <input type="text" placeholder="Card Number" name="cardNumber" value={paymentDetails.cardNumber} onChange={handlePaymentDetailsChange} style={{ width: '100%', marginBottom: '10px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <input type="text" placeholder="Expiry Date" name="expiry" value={paymentDetails.expiry} onChange={handlePaymentDetailsChange} style={{ width: '48%' }} />
                    <input type="text" placeholder="CVV" name="cvv" value={paymentDetails.cvv} onChange={handlePaymentDetailsChange} style={{ width: '48%' }} />
                  </div>
                  {errorMessage && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {errorMessage}
                    </div>
                  )}
                  <button className="btn btn-success mt-4" onClick={handlePayment}>Make Payment</button>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default OrderDetails;
