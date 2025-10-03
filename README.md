# ITI-Ecommerce-Project-Vanilla-JS

This is a simple e-commerce website built with vanilla JavaScript and Firebase.

## Features

*   User authentication (login, registration)
*   Product listing and details
*   Shopping cart
*   Wishlist
*   Checkout process
*   Admin panel for managing products, orders, and users

## Project Structure

The project is organized into the following folders:

*   `assets`: Contains static assets like CSS, images, and JavaScript files.
*   `components`: Contains reusable UI components like the navbar and footer.
*   `config`: Contains configuration files, including the Firebase configuration.
*   `data`: Contains data management scripts for products, cart, and orders.
*   `pages`: Contains the different pages of the application, such as home, products, cart, and admin panel.

## Technologies Used

*   HTML
*   CSS
*   Vanilla JavaScript
*   Bootstrap
*   Firebase (Authentication, Firestore)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Mohamed/ITI-Ecommerce-Project-Vanilla-JS.git
    ```
2.  Open the `index.html` file in a browser.

## Usage

*   Browse the products on the home page or the products page.
*   Add products to the cart or wishlist.
*   Create an account or log in to proceed to checkout.
*   Complete the checkout process to place an order.
*   Access the admin panel to manage products, orders, and users.

## Configuration

To run this project, a Firebase project needs to be set up.

1.  **Create a Firebase Project:**
    *   Go to the [Firebase console](https://console.firebase.google.com/).
    *   Click on "Add project" and follow the instructions.

2.  **Get The Firebase Config:**
    *   In the Firebase project, go to the "Project settings".
    *   Under the "General" tab, in the "Your apps" section, click on the web app icon (`</>`).
    *   Give the app a nickname and click on "Register app".
    *   A `firebaseConfig` object will be provided. Copy this object.

3.  **Create `firebase-config.js`:**
    *   In the `assets/js/` directory, create a file named `firebase-config.js`.
    *   Paste the `firebaseConfig` object into this file and add the following code to initialize Firebase:

    ```javascript
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
    import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
    import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
    import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

    // The web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "API_KEY",
      authDomain: "AUTH_DOMAIN",
      projectId: "PROJECT_ID",
      storageBucket: "STORAGE_BUCKET",
      messagingSenderId: "MESSAGING_SENDER_ID",
      appId: "APP_ID",
      measurementId: "MEASUREMENT_ID"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize and export Firebase services
    export const auth = getAuth(app);
    export const db = getFirestore(app); // db stands for database
    export const storage = getStorage(app);
    ```

**Note:** There are two `firebase-config.js` files in this project. It is recommended to use the one in `assets/js/` and update the `index.html` file to import it.

## Deployment

This project can be deployed to any static web hosting service. Here are the steps for deploying to GitHub Pages:

1.  **Push the code to a GitHub repository.**
2.  **In the repository, go to "Settings" > "Pages".**
3.  **Under "Build and deployment", select "Deploy from a branch" and choose the `main` branch (or the default branch).**
4.  **The website will be deployed to `https://<username>.github.io/<repository-name>/`.

## Pages

The `pages` folder contains the different pages of the application. Each page has its own HTML, CSS, and JavaScript file.

*   **Home:** The landing page of the application. It displays a hero section, featured products, and some marketing content.
*   **Products:** Displays all the products with sorting and filtering options.
*   **Product Details:** Displays the details of a single product, including its name, description, price, and images. Users can add the product to their cart or wishlist from this page.
*   **Cart:** Displays the products that the user has added to their cart. Users can update the quantity of the products or remove them from the cart.
*   **Checkout:** The final step of the purchase process. Users can enter their shipping and payment information to place an order.
*   **Orders:** Displays the user's order history.
*   **Profile:** Displays the user's profile information and allows them to update it.
*   **Wishlist:** Displays the products that the user has added to their wishlist.
*   **Login/Register:** Allows users to create an account or log in to their existing account.
*   **Admin Panel:** A protected area for administrators to manage products, orders, and users.
    *   **Dashboard:** Displays an overview of the store's performance, including total sales, number of orders, and number of users.
    *   **Products:** Allows administrators to add, edit, and delete products.
    *   **Orders:** Allows administrators to view and manage orders.
    *   **Users:** Allows administrators to view and manage users.

## Components

The `components` folder contains reusable UI components.

*   **Navbar:** The main navigation bar of the application. It is displayed on all pages and includes links to the home page, products page, cart, and user profile.
*   **Footer:** The footer of the application. It is displayed on all pages and includes links to social media and other information.

## Data Management

The `data` folder contains scripts for managing the application's data.

*   **`products.js`:** Contains functions for fetching and managing product data from Firebase Firestore.
*   **`cart.js`:** Contains functions for managing the shopping cart, which is stored in the user's browser (local storage).
*   **`orders.js`:** Contains functions for creating and managing orders in Firebase Firestore.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.