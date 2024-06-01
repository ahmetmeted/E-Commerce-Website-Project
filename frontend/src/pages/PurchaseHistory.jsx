import React, { useEffect, useState } from 'react';
import { Navbar, Footer } from '../components';

const PurchaseHistory = () => {
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const userId = localStorage.getItem('user_id');
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        if (authToken && userId) {
            fetch(`http://localhost:8000/api/purchase-history/?owner=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                setPurchaseHistory(data);
            })
            .catch(error => console.error('Error fetching purchase history:', error));
        }
    }, [userId, authToken]);

    return (
        <>
            <Navbar />
            <div className="container my-3 py-3">
                <h1 className="text-center">Purchase History</h1>
                <hr />
                <div className="container py-5">
                    <div className="row d-flex justify-content-center my-4">
                        <div className="col-md-10">
                            {purchaseHistory.length > 0 ? (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Total Price</th>
                                            <th>Purchase Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchaseHistory.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.id}</td>
                                                <td>{item.item_name}</td>
                                                <td>{item.item_quantity}</td>
                                                <td>${parseFloat(item.order_total_price).toFixed(2)}</td>
                                                <td>{new Date(item.order_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No purchase history found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PurchaseHistory;
