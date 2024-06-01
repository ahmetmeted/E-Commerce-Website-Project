import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaStar } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const authToken = localStorage.getItem('authToken');
  const [rating, setRating] = useState(1); // Minimum rating is 1
  const [quantity, setQuantity] = useState(1);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingComment, setEditingComment] = useState("");
  const [editingRating, setEditingRating] = useState(1); // Minimum rating is 1
  const [newComment, setNewComment] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      try {
        const productResponse = await fetch(`http://localhost:8000/api/product/${id}/`);
        const productData = await productResponse.json();

        const storeResponse = await fetch(`http://localhost:8000/api/store/${productData.store_id}`);
        const storeData = await storeResponse.json();

        const commentsResponse = await fetch(`http://localhost:8000/api/product-rate/?product=${id}`);
        const commentsData = await commentsResponse.json();

        setProduct({
          ...productData,
          store_name: storeData.store_name,
        });

        // Filter comments to only include those related to the current product
        const filteredComments = commentsData.filter(comment => comment.product === parseInt(id));
        setComments(filteredComments);
      } catch (error) {
        console.error("Failed to fetch product or store details:", error);
      }
      setLoading(false);
    };

    getProduct();
  }, [id]);

  const addToCart = async (productId, quantity) => {
    if (quantity <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/add-to-basket/${productId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Product added to cart:', data);
        dispatch(addCart(data));
      } else {
        console.error('Failed to add product to cart:', data);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/product-rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ product: id, comment: newComment, rating })
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Comment submitted:', data);
        setComments([...comments, data]);
        setNewComment("");
        setRating(1); // Reset to minimum rating of 1
      } else {
        console.error('Failed to submit comment:', data);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
    setShowAddModal(false);
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/product-rate/${commentId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        console.log('Comment deleted');
        setComments(comments.filter(comment => comment.id !== commentId));
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const updateComment = async (e) => {
    e.preventDefault();
    if (editingComment.trim() === "") {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/product-rate/${editingCommentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ comment: editingComment, rating: editingRating })
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Comment updated:', data);
        setComments(comments.map(comment => comment.id === editingCommentId ? data : comment));
        setEditingCommentId(null);
        setEditingComment("");
        setEditingRating(1); // Reset to minimum rating of 1
      } else {
        console.error('Failed to update comment:', data);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
    setShowEditModal(false);
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingComment(comment.comment);
    setEditingRating(comment.rating);
    setShowEditModal(true);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingComment("");
    setEditingRating(1); // Reset to minimum rating of 1
    setShowEditModal(false);
  };

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  const Loading = React.memo(() => {
    return (
      <div className="container my-5 py-2">
        <div className="row">
          <div className="col-md-6 py-3">
            <Skeleton height={400} width={400} />
          </div>
          <div className="col-md-6 py-5">
            <Skeleton height={30} width={250} />
            <Skeleton height={90} />
            <Skeleton height={40} width={70} />
            <Skeleton height={50} width={110} />
            <Skeleton height={120} />
            <Skeleton height={40} width={110} inline={true} />
            <Skeleton className="mx-3" height={40} width={110} />
          </div>
        </div>
      </div>
    );
  });

  const ShowProduct = () => {
    if (!product) return <Loading />;

    return (
      <div className="container my-5 py-2">
        <div className="row">
          <div className="col-md-6 col-sm-12 py-3">
            <img
              className="img-fluid"
              src={product.product_images}
              alt={product.product_name}
              width="400px"
              height="400px"
            />
          </div>
          <div className="col-md-6 py-5">
            <h1 className="display-5">{product.product_name}</h1>
            <h3 className="display-6 my-4">${product.product_price.toFixed(2)}</h3>
            <p className="lead">Store Name : {product.store_name}</p>
            <p className="lead">{product.product_description}</p>

            <div className="d-flex align-items-center my-3">
              <button className="btn btn-outline-secondary" onClick={decreaseQuantity}>-</button>
              <input
                type="number"
                className="form-control mx-2"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ width: "60px", textAlign: "center" }}
                min="1"
              />
              <button className="btn btn-outline-secondary" onClick={increaseQuantity}>+</button>
            </div>

            <button
              className="btn btn-outline-dark"
              onClick={() => addToCart(product.id, quantity)}
              disabled={!authToken}>
              Add to Cart
            </button>
            <Link to="/cart" className="btn btn-dark mx-3">
              Go to Cart
            </Link>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-md-12">
            <h3 className="my-3">Comments</h3>
            {comments.length === 0 && <p>No comments yet.</p>}
            {comments.map((comment) => (
              <div key={comment.id} className="card mb-3">
                <div className="card-body">
                  <div>
                    <p>{comment.comment}</p>
                    <div className="mb-2">
                      {[...Array(5)].map((star, i) => (
                        <FaStar
                          key={i}
                          size={20}
                          color={i < comment.rating ? "#ffc107" : "#e4e5e9"}
                        />
                      ))}
                    </div>
                    {authToken && comment.user === parseInt(localStorage.getItem('user_id')) && (
                      <div className="mt-2">
                        <button className="btn btn-danger me-2" onClick={() => deleteComment(comment.id)}>
                          Delete
                        </button>
                        <button className="btn btn-warning" onClick={() => startEditing(comment)}>
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {authToken && (
          <div className="row mt-5">
            <div className="col-md-12">
              <h3 className="my-3">Add Your Comment</h3>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Add Comment
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">
          {loading ? <Loading /> : <ShowProduct />}
        </div>
      </div>
      <Footer />

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Your Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={submitComment}>
            <div className="mb-3">
              {[...Array(5)].map((star, i) => {
                const ratingValue = i + 1;
                return (
                  <label key={i}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      checked={rating === ratingValue}
                      onChange={() => setRating(ratingValue)}
                      style={{ display: 'none' }}
                    />
                    <FaStar
                      size={30}
                      color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                );
              })}
            </div>
            <textarea
              className="form-control mb-3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
              placeholder="Write your comment"
            />
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={cancelEditing}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Your Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={updateComment}>
            <div className="mb-3">
              {[...Array(5)].map((star, i) => {
                const ratingValue = i + 1;
                return (
                  <label key={i}>
                    <input
                      type="radio"
                      name="editingRating"
                      value={ratingValue}
                      checked={editingRating === ratingValue}
                      onChange={() => setEditingRating(ratingValue)}
                      style={{ display: 'none' }}
                    />
                    <FaStar
                      size={30}
                      color={ratingValue <= editingRating ? "#ffc107" : "#e4e5e9"}
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                );
              })}
            </div>
            <textarea
              className="form-control mb-3"
              value={editingComment}
              onChange={(e) => setEditingComment(e.target.value)}
              rows="3"
              placeholder="Update your comment"
            />
            <Button variant="primary" type="submit">
              Update
            </Button>
            <Button variant="secondary" onClick={cancelEditing} className="ms-2">
              Cancel
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Product;
