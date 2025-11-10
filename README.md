Here is a professional and detailed README.md file for your e-commerce project.

-----

# Full-Stack E-commerce Platform

This is a comprehensive, full-stack e-commerce application built with a modern tech stack. The platform supports user authentication, product catalog browsing with search and filtering, a complete shopping cart and order workflow, secure payments via Stripe, and a dedicated admin panel for managing products and orders.

The entire application is containerized with Docker, ensuring a consistent and isolated environment for development and production.

## Table of Contents

  * [Features](https://www.google.com/search?q=%23features)
  * [Tech Stack](https://www.google.com/search?q=%23tech-stack)
  * [Prerequisites](https://www.google.com/search?q=%23prerequisites)
  * [Getting Started](https://www.google.com/search?q=%23getting-started)
      * [Environment Configuration](https://www.google.com/search?q=%23environment-configuration)
      * [Running with Docker (Recommended)](https://www.google.com/search?q=%23running-with-docker-recommended)
      * [Running Locally (Manual)](https://www.google.com/search?q=%23running-locally-manual)
  * [API Endpoints](https://www.google.com/search?q=%23api-endpoints)
  * [License](https://www.google.com/search?q=%23license)

## Features

### User & Customer Features

  * **User Authentication:** Secure user registration and login using JSON Web Tokens (JWT).
  * **Protected Routes:** Client and server-side route protection based on authentication status.
  * **Product Catalog:** View all products with pagination, search by keyword, and filter by category.
  * **Product Details:** View detailed information for a single product.
  * **Shopping Cart:** Add, update quantities, and remove items from a persistent cart (managed with React Context).
  * **Stock Validation:** Real-time stock checking before adding to cart and during checkout.
  * **Secure Checkout:** Integrated with **Stripe** for secure payment processing.
  * **Order History:** Users can view a list of their past orders and order details.

### Admin Features

  * **Admin Dashboard:** Protected routes accessible only to users with an 'admin' role.
  * **Product Management:** Full CRUD (Create, Read, Update, Delete) capabilities for all products.
  * **Order Management:** View all user orders and update order status (e.g., "Processing," "Shipped").
  * **Stock Management:** Product stock is automatically deduced upon successful payment.

### Technical Features

  * **Containerized:** Fully containerized with **Docker** and **Docker Compose** for easy setup and deployment.
  * **Optimized Frontend:** Uses a **multi-stage Docker build** with Nginx to serve the static React files, reducing the final image size by \~80%.
  * **Payment Webhooks:** Handles Stripe webhooks to confirm payment success and update order status asynchronously.

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React.js, TypeScript, Tailwind CSS, React Router, React Context API, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Neon DB) |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js |
| **Payments** | Stripe API |
| **DevOps** | Docker, Docker Compose, Nginx |

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

  * [Node.js](https://nodejs.org/en/) (v18 or later)
  * [npm](https://www.npmjs.com/) (or [Yarn](https://yarnpkg.com/))
  * [Docker](https://www.docker.com/products/docker-desktop/)
  * [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### 1\. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2\. Environment Configuration

This project requires environment variables for both the backend server and the frontend client.

**A. Backend (server)**

Create a `.env` file in the `server/` directory:

```bash
# server/.env
PORT=3000
DATABASE_URL="your_neon_db_postgresql_connection_string"
JWT_SECRET="your_strong_jwt_secret"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_signing_secret"
CLIENT_URL="http://localhost:5173" 
```

**B. Frontend (client)**

Create a `.env` file in the `client/` directory:

```bash
# client/.env
VITE_API_BASE_URL="http://localhost:3000/api"
VITE_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
```

-----

## Running the Application

You can run the application using Docker (recommended) or manually on your local machine.

### Method 1: Docker (Recommended)

This is the simplest and most reliable method. It builds the images and runs the containers for the frontend (Nginx), backend (Node.js), and database (if you were using a Docker-based DB). Since you are using Neon DB (a remote service), the `docker-compose.yml` will just run the `client` and `server`.

1.  Ensure your `.env` files are created as described above.

2.  Run the following command from the project root:

    ```bash
    docker-compose up --build
    ```

3.  The application will be available at:

      * **Frontend:** `http://localhost:5173` (or your Nginx port)
      * **Backend:** `http://localhost:3000`

### Method 2: Running Locally (Manual)

This method requires you to run the frontend and backend in separate terminal sessions.

**A. Terminal 1: Backend Server**

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure your `server/.env` file is in place.
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  The backend API will be running on `http://localhost:3000`.

**B. Terminal 2: Frontend Client**

1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure your `client/.env` file is in place.
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  The frontend application will be available at `http://localhost:5173`.

-----

## API Endpoints

A brief overview of the main API routes.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user. |
| `POST` | `/api/auth/login` | Log in a user and return a JWT. |
| `GET` | `/api/users/profile` | Get the profile of the currently logged-in user. (Protected) |
| `GET` | `/api/products` | Get all products. Supports `page`, `search`, `category` queries. |
| `GET` | `/api/products/:id` | Get a single product by ID. |
| `POST` | `/api/products` | Create a new product. (Admin only) |
| `PUT` | `/api/products/:id` | Update an existing product. (Admin only) |
| `GET` | `/api/cart` | Get the current user's cart. (Protected) |
| `POST` | `/api/cart` | Add an item to the cart. (Protected) |
| `PUT` | `/api/cart/:itemId` | Update the quantity of a cart item. (Protected) |
| `DELETE`| `/api/cart/:itemId` | Remove an item from the cart. (Protected) |
| `POST` | `/api/orders/create-payment-intent` | Creates a Stripe payment intent. (Protected) |
| `GET` | `/api/orders` | Get the order history for the current user. (Protected) |
| `GET` | `/api/orders/all` | Get all orders for all users. (Admin only) |
| `POST` | `/api/stripe/webhook` | Stripe webhook endpoint for payment confirmation. |

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
