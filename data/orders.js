import { db } from "../config/firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";


export const createOrder = async (cartItems,  totalAmount, address, payment_method) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("User must be logged in to create an order.");

    window.location.href = "../auth/login.html";
  }

  const ordersCollectionRef = collection(db, "orders");

  const now = new Date();

  const newOrderData = {
    userId: user.uid, 
    products: cartItems, 
    total: totalAmount,
    status: "pending", 
    date: now.toString(),
    address: address,
    payment_method: payment_method.card.brand !== "cash_on_delivery" ?  payment_method.card.brand + " ****" + payment_method.card.last4 : "Cash on Delivery",
  };

  try {
    const docRef = await addDoc(ordersCollectionRef, newOrderData);
    console.log("Order created successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};


export async function getUserOrders(uid) {
  try {
    const productsCollection = collection(db, "orders");


    const q = query(productsCollection, where("userId", "==", uid), orderBy("date", "desc") );
  
    const querySnapshot = await getDocs(q);

    let orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("f p ", orders);

    return orders;
  } catch (error) {
    console.error("Error fetching products: ", error);
  }
}

export function getOrderById(orderId) {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      unsubscribe();

      if (user) {
        // User is signed in.
        console.log("uid", user.uid);
        try {
          const orderRef = doc(db, "orders", orderId);
          const orderDoc = await getDoc(orderRef);

          if (orderDoc.exists() && orderDoc.data().userId === user.uid) {
            resolve({ id: orderDoc.id, ...orderDoc.data() });
          } else {
            console.warn("Order not found or access denied.");
            resolve(null);
          }
        } catch (error) {
          console.error("Error fetching order document: ", error);
          reject(error); 
        }
      } else {
        console.error("User must be logged in to view an order.");
        window.location.href = "../auth/login.html";
        resolve(null); 
      }
    });
  });
}