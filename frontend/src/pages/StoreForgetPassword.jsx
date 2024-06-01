import { Footer, Navbar } from "../components";
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8000/api/customer/forget-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data); // Check the entire response structure

      setMessage('Password reset link has been sent to your email.');
      setEmail('');
    } catch (error) {
      console.error('Error:', error.message);
      setError(error.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Forgot Password</h1>
        <hr />
        <div className="row my-4 h-100">
          <div className="col-md-4 col-lg-4 col-sm-8 mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="my-3">
                <label htmlFor="floatingInput">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="floatingInput"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              {message && <div className="alert alert-success text-center">{message}</div>}
              {error && <div className="alert alert-danger text-center">{error}</div>}
              <div className="text-center">
                <button className="btn btn-dark" type="submit">
                  Send Reset Link
                </button>
              </div>
              <div className="text-center my-2">
                <Link to="/login" className="text-decoration-underline text-info">Back to Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;
