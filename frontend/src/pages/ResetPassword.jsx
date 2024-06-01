import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Footer, Navbar } from "../components";

const ResetPassword = () => {
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword1 !== newPassword2) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/customer/reset-password/${userId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_password1: newPassword1,
          new_password2: newPassword2,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password. Please try again.');
      }

      const data = await response.json();
      setMessage(data.message);
      setNewPassword1('');
      setNewPassword2('');
      navigate('/');  // Redirect to Home page
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Reset Password</h1>
        <hr />
        <div className="row my-4 h-100">
          <div className="col-md-4 col-lg-4 col-sm-8 mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="my-3">
                <label htmlFor="newPassword1">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword1"
                  placeholder="New Password"
                  value={newPassword1}
                  onChange={e => setNewPassword1(e.target.value)}
                />
              </div>
              <div className="my-3">
                <label htmlFor="newPassword2">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword2"
                  placeholder="Confirm New Password"
                  value={newPassword2}
                  onChange={e => setNewPassword2(e.target.value)}
                />
              </div>
              {message && <div className="alert alert-success text-center">{message}</div>}
              {error && <div className="alert alert-danger text-center">{error}</div>}
              <div className="text-center">
                <button className="btn btn-dark" type="submit">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;
