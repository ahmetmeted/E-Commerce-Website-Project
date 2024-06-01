import React, { useState } from "react";
import styled from 'styled-components';

const ModalContent = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  background-color: #343a40;
  color: #fff;
  border-bottom: none;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

const ModalTitle = styled.h5`
  margin: 0;
`;

const CloseButton = styled.button`
  color: #fff;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: none;
`;

const Button = styled.button`
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &.btn-secondary {
    background-color: #6c757d;
    color: #fff;
  }

  &.btn-primary {
    background-color: #007bff;
    color: #fff;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 0.5rem;
`;

const EditProduct = ({ product, onClose }) => {
  const [productName, setProductName] = useState(product.product_name);
  const [productPrice, setProductPrice] = useState(product.product_price);
  const [productDescription, setProductDescription] = useState(product.product_description);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (productPrice <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error("No token found, please log in first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("product_name", productName);
      formData.append("product_price", productPrice);
      formData.append("product_description", productDescription);

      const response = await fetch(`http://localhost:8000/api/product/${product.id}/`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        onClose(); // Close the edit form on success
        window.location.reload(); // Reload the page to reflect changes
      } else {
        console.error("Failed to update product:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  return (
    <div className="modal show" style={{ display: "block" }}>
      <div className="modal-dialog">
        <ModalContent className="modal-content">
          <ModalHeader className="modal-header">
            <ModalTitle className="modal-title">Edit Product</ModalTitle>
            <CloseButton type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </CloseButton>
          </ModalHeader>
          <div className="modal-body">
            <FormGroup className="form-group">
              <Label>Product Name</Label>
              <Input
                type="text"
                className="form-control"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </FormGroup>
            <FormGroup className="form-group">
              <Label>Product Price</Label>
              <Input
                type="number"
                className="form-control"
                value={productPrice}
                onChange={(e) => setProductPrice(parseFloat(e.target.value))}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormGroup>
            <FormGroup className="form-group">
              <Label>Product Description</Label>
              <Textarea
                className="form-control"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </FormGroup>
          </div>
          <ModalFooter className="modal-footer">
            <Button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="button" className="btn btn-primary" onClick={handleSave}>
              Save changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </div>
    </div>
  );
};

export default EditProduct;
