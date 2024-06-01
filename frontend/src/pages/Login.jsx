import { Footer, Navbar } from "../components";
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Correct import of jwtDecode

const CombinedLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState('customer'); // Default user type

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate(userType === 'store_owner' ? '/store-home' : '/');
    }
  }, [navigate, userType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const loginUrl = userType === 'customer' ? 'http://localhost:8000/api/customer/login/' : 'http://localhost:8000/api/store-owner/login/';

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      const token = data.access;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user_type', userType);
      localStorage.setItem('email', data.email); // Store the email from response

      let decoded;
      if (typeof token === 'string') {
        decoded = jwtDecode(token);
        localStorage.setItem('user_id', decoded.user_id);
        localStorage.setItem('user_name', username); // Store the username from state
      } else {
        throw new Error('Invalid token type: Token must be a string');
      }

      if (userType === 'store_owner') {
        const storeId = data.store_id; // Adjust this if necessary
        localStorage.setItem('store_id', storeId);
        navigate('/store-home');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error.message);
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-5 py-5">
        <h1 className="text-center">Welcome Back!</h1>
        <p className="text-center lead">Login to continue</p>
        <div className="row my-4 justify-content-center">
          <div className="col-md-6 col-lg-5 col-sm-8">
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
              <div className="my-3">
                <label htmlFor="userType" className="form-label">User Type</label>
                <select
                  className="form-select"
                  id="userType"
                  value={userType}
                  onChange={e => setUserType(e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <div className="my-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="my-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className="d-grid">
                <button className="btn btn-primary" type="submit">
                  Login
                </button>
              </div>
              <div className="text-center my-3">
                <Link to={userType === 'customer' ? "/register" : "/store-register"} className="btn btn-outline-secondary">Register</Link>
              </div>
              <div className="text-center my-2">
                <Link to={userType === 'customer' ? "/customer-forget-password" : "/customer-forget-password"} className="btn btn-link">Forgot Password?</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .btn-primary {
          background-color: #007bff;
          border-color: #007bff;
          transition: background-color 0.3s, border-color 0.3s;
        }

        .btn-primary:hover {
          background-color: #0056b3;
          border-color: #004085;
        }

        .btn-outline-secondary {
          color: #6c757d;
          border-color: #6c757d;
          transition: color 0.3s, border-color 0.3s;
        }

        .btn-outline-secondary:hover {
          color: white;
          background-color: #6c757d;
          border-color: #6c757d;
        }

        .btn-link {
          color: #007bff;
          transition: color 0.3s;
        }

        .btn-link:hover {
          color: #0056b3;
        }
      `}</style>
    </>
  );
};

export default CombinedLogin;
