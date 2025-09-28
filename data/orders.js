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
  addDoc,
  updateDoc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";


export const createOrder = async (cartItems, totalAmount, address, payment_method) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("User must be logged in to create an order.");
    window.location.href = "../auth/login.html";
    return null;
  }

  const orderId = await runTransaction(db, async (transaction) => {
    const newOrderRef = doc(collection(db, "orders"));
    const productSnapshots = {};

    for (const item of cartItems) {
      const productRef = doc(db, "products", item.id);
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error(`Product with ID ${item.id} does not exist.`);
      }

      const currentStock = productDoc.data().stock;
      if (currentStock < item.quantity) {
        showNotification(`Not enough stock for ${productDoc.data().name}. Only ${currentStock} left.`, "danger");
        throw new Error(`Not enough stock for ${productDoc.data().name}. Only ${currentStock} left.`);
      }

      productSnapshots[item.id] = productDoc;
    }

    for (const item of cartItems) {
      const productRef = doc(db, "products", item.id);
      const productDoc = productSnapshots[item.id];
      const newStock = productDoc.data().stock - item.quantity;
      transaction.update(productRef, { stock: newStock });
    }

    const now = new Date();
    const newOrderData = {
      userId: user.uid,
      products: cartItems,
      total: totalAmount,
      status: "pending",
      date: now.toString(),
      address: address,
      payment_method: payment_method.card.brand !== "cash_on_delivery"
        ? `${payment_method.card.brand} ****${payment_method.card.last4}`
        : "Cash on Delivery",
    };

    transaction.set(newOrderRef, newOrderData);

    return newOrderRef.id;
  });

  console.log("Order created successfully with ID:", orderId);
  return orderId;
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

function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    const icon = type === "success" ? "check-circle" : "exclamation-triangle";
    notification.className = `alert alert-${type} position-fixed`;
    notification.style.cssText =
        "top: 80px; right: 20px; z-index: 9999; min-width: 300px;";
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i> ${message}
        <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentElement) {
        notification.remove();
        }
    }, 3000);
}
