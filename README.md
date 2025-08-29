# Project Setup Guide

This guide will walk you through setting up and running the E-Library API, which includes a NestJS backend.

---

### **1. Prerequisites**

Before you begin, ensure you have the following installed on your machine:

* **Node.js**: It's recommended to use a version of Node.js 16 or later.
* **npm** or **yarn**: A package manager for installing project dependencies. `npm` comes with Node.js.
* **Sqlite**: A local instance of Sqlite is required for the backend database. Make sure it's running.


1.  **Install Dependencies**

    Run the following command to install all the required packages for the backend:

    ```bash
    npm install
    ```

2.  **Configure Environment Variables**

    Create a file named `.env` in the `backend` directory and add the following content. This configures the database connection and the AI gateway.

    ```dotenv

    NODE_ENV=development
    PORT=3000
    JWT_SECRET=your_jwt_secret_here
    JWT_EXPIRES_IN=3600s
    DB_PATH=./library.db
    Library_GATEWAY_PROVIDER="openlibrary"
    OPEN_LIBRARY_API=https://openlibrary.org

   ```

3.  **Run the Backend**

    Start the NestJS backend server with the following command:

     ```bash
     npm run start:dev
     ```

4.  **Run the Backend Test**

    Run Test for the NestJS backend server with the following command:

    ```bash
    npm run test
    ```

    The backend will run on `http://localhost:3000` by default.
    Here is the live url `https://e-library-tf7k.onrender.com/api/v1` 
    Here is the postman documentation `https://documenter.getpostman.com/view/14724403/2sB3HgR3vw`

