import React from 'react';
import ReactDOM from 'react-dom/client';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';


import { Home, Product, Products, AboutPage, ContactPage, Cart, Login, Register, Checkout, PageNotFound, Profile, StoreHomePage, StoreForgetPassword, CustomerForgetPassword, StoreProduct, ResetPassword, PurchaseHistory } from "./pages"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Products />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/product/*" element={<PageNotFound />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/store-home" element={<StoreHomePage />} />
        <Route path="/store-forget-password" element={<StoreForgetPassword />} />
        <Route path="/customer-forget-password" element={<CustomerForgetPassword />} />
        <Route path="/store-product" element={<StoreProduct />} />
        <Route path="/reset-password/:userId" element={<ResetPassword />} />
        <Route path="/purchase-history" element={<PurchaseHistory />} />
      </Routes>
    </Provider>
  </BrowserRouter>
);