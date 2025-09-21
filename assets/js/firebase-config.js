// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

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
export const storage = getStorage(app);