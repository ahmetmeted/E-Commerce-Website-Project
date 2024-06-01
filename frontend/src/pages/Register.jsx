import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Footer, Navbar } from "../components";

const CombinedRegister = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secondPassword, setSecondPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState('customer'); // Default user type
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== secondPassword) {
      setError('Passwords do not match. Please try again.');
      setLoading(false);
      return;
    }

    const registerUrl = userType === 'customer' ? 'http://localhost:8000/api/customer/create/' : 'http://localhost:8000/api/store-owner/create/';

    try {
      const body = userType === 'customer' ? {
        email,
        username,
        password,
        first_name: firstName,
        last_name: lastName,
      } : {
        email,
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        store_name: storeName,
        store_address: storeAddress,
      };

      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      navigate(userType === 'customer' ? '/login' : '/login');
    } catch (error) {
      console.error('Error:', error.message);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-5 py-5">
        <h1 className="text-center">Register</h1>
        <p className="text-center lead">Create your account</p>
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
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="my-3">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  placeholder="First Name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className="my-3">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              {userType === 'store_owner' && (
                <>
                  <div className="my-3">
                    <label htmlFor="storeName" className="form-label">Store Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="storeName"
                      placeholder="Store Name"
                      value={storeName}
                      onChange={e => setStoreName(e.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label htmlFor="storeAddress" className="form-label">Store Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="storeAddress"
                      placeholder="Store Address"
                      value={storeAddress}
                      onChange={e => setStoreAddress(e.target.value)}
                    />
                  </div>
                </>
              )}
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
              <div className="my-3">
                <label htmlFor="secondPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="secondPassword"
                  placeholder="Confirm Password"
                  value={secondPassword}
                  onChange={e => setSecondPassword(e.target.value)}
                />
              </div>
              <div className="d-grid">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
              <div className="text-center my-3">
                <p>Already have an account? <Link to="/login" className="btn btn-outline-secondary">Login</Link></p>
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
      `}</style>
    </>
  );
}

export default CombinedRegister;
