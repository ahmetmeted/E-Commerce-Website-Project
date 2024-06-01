![Project Screenshot](path_to_your_image.png)

# E-Commerce Website Project

This project is an e-commerce website developed as part of a school assignment. It showcases a simple yet functional online store, where users can browse products, search for items, and manage their accounts.

## Technologies Used

- **React**: For the frontend user interface.
- **Django**: For the backend server and API.
- **SQLite**: For the database.

## How to Run the Project

### Starting the Backend

1. Navigate to the backend directory:
    ```sh
    cd backend/
    ```
2. Start the Django server:
    ```sh
    python3 manage.py runserver
    ```

### Starting the Frontend

1. Navigate to the frontend directory:
    ```sh
    cd frontend/
    ```
2. Install the necessary npm packages:
    ```sh
    npm install
    ```
3. Start the React application:
    ```sh
    npm start
    ```

### Accessing the Admin Panels

- To access the Django admin dashboard, go to: `http://localhost:8000/admin/`
- To access the website admin panel, go to: `http://localhost:3000/admin/`

## Features

- Store owners can add, edit, or delete products.
- Customers can purchase products and receive product information via email.
- Products can be reviewed by customers.

### Note:
For mail operations, you need to edit the section in `settings.py` according to your own email configuration.

## Acknowledgements

Front-end design is inspired by the [React_E-Commerce](https://github.com/ssahibsingh/React_E-Commerce) repository.

Thank you for the assistance.
