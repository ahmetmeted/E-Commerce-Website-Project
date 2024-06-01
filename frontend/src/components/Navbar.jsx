import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [basketCount, setBasketCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
    const [username, setUsername] = useState(localStorage.getItem('user_name'));
    const userId = localStorage.getItem('user_id');
    const userType = localStorage.getItem('user_type');
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        setIsAuthenticated(!!authToken);
        const storedUsername = localStorage.getItem('user_name');
        setUsername(storedUsername);

        if (authToken) {
            fetch('http://localhost:8000/api/basket/')
                .then(response => response.json())
                .then(data => {
                    const userBasketCount = data.filter(item => item.user.toString() === userId).length;
                    setBasketCount(userBasketCount);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    }, [userId]);

    const handleLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        navigate('/login'); // Explicitly navigate to the login page
    };

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    const renderCustomerNavbar = () => (
        <>
            <ul className="navbar-nav m-auto my-2 text-center">
                <li className="nav-item">
                    <NavLink className="nav-link" to="/">Home</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="nav-link" to="/product">Products</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="nav-link" to="/about">About</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="nav-link" to="/contact">Contact</NavLink>
                </li>
            </ul>
            <div className="buttons text-center d-flex align-items-center">
                <div className="dropdown">
                    <button className="btn btn-light dropdown-toggle m-2" type="button" onClick={toggleDropdown}>
                        Welcome, {username ? username.toUpperCase() : 'Guest'}
                    </button>
                    <div className={`dropdown-menu${showDropdown ? ' show' : ''}`}>
                        <NavLink className="dropdown-item" to="/profile">Profile</NavLink>
                        <NavLink className="dropdown-item" to="/purchase-history">Purchase History</NavLink>
                        <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
                    </div>
                </div>
                <NavLink to="/cart" className="btn btn-outline-dark m-2">
                    <i className="fa fa-cart-shopping mr-1"></i> Cart 
                </NavLink>
            </div>
        </>
    );

    const renderStoreOwnerNavbar = () => (
        <>
            <ul className="navbar-nav m-auto my-2 text-center">
                <li className="nav-item">
                    <NavLink className="nav-link" to="/store-home">New Products</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className="nav-link" to="/store-product">Store Product</NavLink>
                </li>
            </ul>
            <div className="buttons text-center d-flex align-items-center">
                <div className="dropdown">
                    <button className="btn btn-light dropdown-toggle m-2" type="button" onClick={toggleDropdown}>
                        Welcome, {username ? username.toUpperCase() : 'Guest'}
                    </button>
                    <div className={`dropdown-menu${showDropdown ? ' show' : ''}`}>
                        <NavLink className="dropdown-item" to="/profile">Profile</NavLink>
                        <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light py-3 sticky-top">
            <div className="container">
                <NavLink to="/" className="navbar-brand fw-bold fs-4 px-2">OZU Store</NavLink>
                <button className="navbar-toggler mx-2" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    {isAuthenticated ? (
                        userType === 'customer' ? renderCustomerNavbar() : renderStoreOwnerNavbar()
                    ) : (
                        <>
                            <ul className="navbar-nav m-auto my-2 text-center">
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/">Home</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/product">Products</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/about">About</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/contact">Contact</NavLink>
                                </li>
                            </ul>
                            <div className="buttons text-center">
                                <NavLink to="/login" className="btn btn-outline-dark m-2">
                                    <i className="fa fa-sign-in-alt mr-1"></i> Login
                                </NavLink>
                                <NavLink to="/register" className="btn btn-outline-dark m-2">
                                    <i className="fa fa-user-plus mr-1"></i> Register
                                </NavLink>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
