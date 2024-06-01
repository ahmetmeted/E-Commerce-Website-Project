import React, { useState, useEffect } from "react";
import { Navbar, Footer } from "../components";

const UserProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        email: "",
        username: "",
        firstName: "",
        lastName: ""
    });

    const authToken = localStorage.getItem('authToken');

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/customer/get-user-info/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const customerData = await response.json();

            // Update local storage with new user details
            localStorage.setItem('user_name', customerData.username);
            localStorage.setItem('email', customerData.email);
            localStorage.setItem('first_name', customerData.first_name);
            localStorage.setItem('last_name', customerData.last_name);

            // Update user state with new user details from response
            setUser({
                email: customerData.email,
                username: customerData.username,
                firstName: customerData.first_name,
                lastName: customerData.last_name
            });

        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchUserData();

        // Update the component state when the local storage changes
        const handleStorageChange = () => {
            setUser({
                email: localStorage.getItem('email') || "",
                username: localStorage.getItem('user_name') || "",
                firstName: localStorage.getItem('first_name') || "",
                lastName: localStorage.getItem('last_name') || ""
            });
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    const saveProfile = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/customer/change-user-info/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    username: user.username,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    email: user.email,
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const customerData = await response.json();

            // Update local storage with new user details
            localStorage.setItem('user_name', customerData.username);
            localStorage.setItem('first_name', customerData.first_name);
            localStorage.setItem('last_name', customerData.last_name);
            localStorage.setItem('email', customerData.email); // Add this line

            // Update user state with new user details from response
            setUser({
                email: customerData.email,
                username: customerData.username,
                firstName: customerData.first_name,
                lastName: customerData.last_name
            });

            console.log(customerData); // Log the updated user data
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsEditing(false); // Switch back to display mode
        }
    };

    return (
        <>
            <Navbar />
            <div className="container my-3 py-3">
                <h1 className="text-center">Profile</h1>
                <hr />
                {!isEditing ? (
                    <div>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>First Name:</strong> {user.firstName}</p>
                        <p><strong>Last Name:</strong> {user.lastName}</p>
                        <button className="btn btn-primary" onClick={toggleEditMode}>Edit Profile</button>
                    </div>
                ) : (
                    <>
                        <div className="mb-3">
                            <label>Email</label>
                            <input type="email" className="form-control" value={user.email} readOnly />
                        </div>
                        <div className="mb-3">
                            <label>Username</label>
                            <input type="text" className="form-control" value={user.username} onChange={handleInputChange} name="username" />
                        </div>
                        <div className="mb-3">
                            <label>First Name</label>
                            <input type="text" className="form-control" value={user.firstName} onChange={handleInputChange} name="firstName" />
                        </div>
                        <div className="mb-3">
                            <label>Last Name</label>
                            <input type="text" className="form-control" value={user.lastName} onChange={handleInputChange} name="lastName" />
                        </div>
                        <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
                        <button className="btn btn-secondary ml-2" onClick={toggleEditMode}>Cancel</button>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
};

export default UserProfile;
