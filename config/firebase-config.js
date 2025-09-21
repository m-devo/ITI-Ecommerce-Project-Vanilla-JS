// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, writeBatch, doc , getDocs} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPYAyPbY3Ds7CbKEnsnxsVNwWZ2B9aUIY",

  authDomain: "ecommerce-project-ac1dd.firebaseapp.com",

  projectId: "ecommerce-project-ac1dd",

  storageBucket: "ecommerce-project-ac1dd.firebasestorage.app",

  messagingSenderId: "942090374068",

  appId: "1:942090374068:web:f632a0705fb185bc2fc0e1",

  measurementId: "G-2ECRC0PSE5"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // db stands for database



// let products = [
//   {
//     id: 1,
//     name: "Wireless Headphones",
//     description:
//       "High-quality wireless headphones with noise cancellation and premium sound",
//     price: 89.99,
//     image:
//       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.5,
//     stock: 15,
//     category: "audio",
//     isFeatured: true,
//   },
//   {
//     id: 2,
//     name: "Smart Watch",
//     description:
//     "Feature-rich smartwatch with health monitoring and fitness tracking",
//     price: 199.99,
//     image:
//     "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.8,
//     stock: 8,
//     category: "electronics",
//     isFeatured: true,
//   },
//   {
//     id: 3,
//     name: "Laptop Backpack",
//     description:
//     "Durable laptop backpack with multiple compartments and water resistance",
//     price: 49.99,
//     image:
//     "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.2,
//     stock: 23,
//     category: "accessories",
//     isFeatured: true,
//   },
//   {
//     id: 4,
//     name: "Bluetooth Speaker",
//     description:
//     "Portable bluetooth speaker with amazing sound quality and long battery life",
//     price: 79.99,
//     image:
//     "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.6,
//     stock: 12,
//     category: "audio",
//     isFeatured: true,
//   },
//   {
//     id: 5,
//     name: "Wireless Mouse",
//     description:
//     "Ergonomic wireless mouse for productivity and gaming with nice price check it out ",
//     price: 29.99,
//     image:
//     "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.3,
//     stock: 31,
//     category: "electronics",
//     isFeatured: true,
//   },
//   {
//     id: 6,
//     name: "Phone Case",
//     description:
//       "Protective phone case with wireless charging support and premium materials",
//     price: 24.99,
//     image:
//       "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.1,
//     stock: 45,
//     category: "accessories",
//     isFeatured: true,

//   },
//   {
//     id: 7,
//     name: "Gaming Keyboard",
//     description:
//       "Mechanical gaming keyboard with RGB backlighting and tactile switches",
//     price: 129.99,
//     image:
//       "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.7,
//     stock: 18,
//     category: "electronics",
//     isFeatured: true,
//   },
//   {
//     id: 8,
//     name: "Wireless Earbuds",
//     description:
//       "True wireless earbuds with active noise cancellation and premium audio",
//     price: 159.99,
//     image:
//       "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.4,
//     stock: 22,
//     category: "audio",
//     isFeatured: true,
//   },
//   {
//     id: 9,
//     name: "USB-C Hub",
//     description: "Multi-port USB-C hub with HDMI, USB 3.0, and power delivery",
//     price: 39.99,
//     image:
//       "https://images.unsplash.com/photo-1625842268584-8f3296236761?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.0,
//     stock: 35,
//     category: "electronics",
//     isFeatured: true,
//   },
//   {
//     id: 10,
//     name: "Wireless Charger",
//     description:
//       "Fast wireless charging pad compatible with all Qi-enabled devices",
//     price: 34.99,
//     image:
//       "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.3,
//     stock: 28,
//     category: "electronics",    
//     isFeatured: true,
//   },
//   {
//     id: 11,
//     name: "Travel Organizer",
//     description:
//       "Premium leather travel organizer for cables, chargers, and small accessories",
//     price: 44.99,
//     image:
//       "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.5,
//     stock: 16,
//     category: "accessories",
//     isFeatured: true,
//   },
//   {
//     id: 12,
//     name: "Portable Monitor",
//     description:
//       "15.6 inch portable monitor with USB-C connectivity for laptops",
//     price: 249.99,
//     image:
//       "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//     rating: 4.6,
//     stock: 9,
//     category: "electronics",
//     isFeatured: true,
//   },
// ];



// --- PRODUCT SEEDER SCRIPT ---
// It's good practice to wrap this in a function so it doesn't run every time.
// function addTestProducts() {
//     const categories = ['audio', 'electronics', 'accessories'];
//     const imagePool = [
//       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1625842268584-8f3296236761?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
//       "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
//     ];

//     const productsCollection = collection(db, 'products');
//     const batch = writeBatch(db);
//     const numberOfProducts = 500;

//     console.log(`🚀 Preparing to generate and add products...`);

//     // products.forEach(product => {
//     //   const newProductRef = doc(productsCollection);
//     //   batch.set(newProductRef, product);
//     // });




//     for (let i = 1; i <= numberOfProducts; i++) {
//       const newProductRef = doc(productsCollection);
//       const productData = {
//         name: `Awesome Product ${i}`,
//         description: `This is a sample description for product #${i}.`,
//         price: parseFloat((Math.random() * 300 + 10).toFixed(2)),
//         image: imagePool[i % imagePool.length],
//         rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
//         stock: Math.floor(Math.random() * 150),
//         category: categories[i % categories.length],
//       };
//       batch.set(newProductRef, productData);
//     }

//     batch.commit()
//       .then(() => {
//         console.log(`✅ Success! Added products.`);
//       })
//       .catch((error) => {
//         console.error("❌ Error writing batch: ", error);
//       });
// }

// addTestProducts();

// To run this, you can open your browser console and type:
// addTestProducts();
// This gives you control over WHEN the products are added.
// To make it available in the console, we attach it to the window object.
// window.addTestProducts = addTestProducts;

// A one-time script to update existing documents
// async function updateDocuments() {
//   // Use the correct syntax for Firestore Client SDK
//   const productsRef = collection(db, 'products');
  
//   // get() is not a function on the collection reference in the client SDK
//   // We need to import getDocs from the SDK and use it on the collection reference
//   const querySnapshot = await getDocs(productsRef);

//   if (querySnapshot.empty) {
//     console.log('No matching documents.');
//     return;
//   }

//   const batch = writeBatch(db);
//   querySnapshot.forEach(doc => {
//     const data = doc.data();
//     if (data.name && !data.name_lowercase) {
//       batch.update(doc.ref, { name_lowercase: data.name.toLowerCase() });
//     }
//   });

//   await batch.commit();
//   console.log('✅ Documents updated successfully.');
// }

// // Call the function to run the script
// updateDocuments().catch(console.error);