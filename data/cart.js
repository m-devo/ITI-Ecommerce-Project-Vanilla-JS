
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { auth, db } from "../config/firebase-config.js";
import { fetchProductById } from "./products.js";

let localCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
let unsubscribeCartListener;

export async function getCart() {
    const user = auth.currentUser;

    if (user) {
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);
        return cartSnap.exists() ? cartSnap.data().items : [];
    } else {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

export async function syncCartOnLogin(userId) {
    const cartRef = doc(db, "carts", userId);

    const cartSnap = await getDoc(cartRef);
    const remoteCart = cartSnap.exists() ? cartSnap.data().items : [];

    const mergedCart = mergeCarts(localCart, remoteCart);
    
    await setDoc(cartRef, { items: mergedCart });

    // listening for real-time updates
    unsubscribeCartListener = onSnapshot(cartRef, (doc) => {
        const updatedCart = doc.exists() ? doc.data().items : [];
        // Update local state and UI whenever Firestore changes
        localCart = updatedCart; 
        updateCartUI(localCart);
    });

    console.log('Cart synced with Firestore');
}

function mergeCarts(local, remote) {
    const merged = [...remote];
    local.forEach(localItem => {
        const remoteItemIndex = merged.findIndex(item => item.productId === localItem.productId);
        if (remoteItemIndex !== -1) {

            merged[remoteItemIndex].quantity += localItem.quantity;
        } else {
            merged.push(localItem);
        }
    });
    localStorage.removeItem('cart'); 
    return merged;
}


export async function updateCart(productId, quantity) {

    const user = auth.currentUser;

    const product = await fetchProductById(productId);

    let cart = await getCart();

    console.log("🚀 ~ updateCart ~ userCart:", cart)

    let currentQuantity = cart.find(item => item.productId === product.id)?.quantity || 0;

    console.log("🚀 ~ updateCart ~ currentQuantity:", currentQuantity)
    
    quantity = currentQuantity + quantity;

    console.log("🚀 ~ updateCart ~ quantity:", quantity)

    // check stock
    if (product.stock < quantity) {
        showNotification(`${product?.name || "Product"} is out of stock`, "danger");

        console.log("Product is out of stock");
        return;
    }

    if (user) {
        const cartRef = doc(db, "carts", user.uid);

        // update quantity if product already exists in cart
        const existingItemIndex = cart.findIndex(item => item.productId === product.id);
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity = quantity;

            await setDoc(cartRef, { items: cart });
            console.log("🚀 ~ updateCart ~ cart:", cart)
        } else {
            // add new product to cart

            const newCartItems = [...cart, { productId: product.id, quantity: quantity, price: product.price, name: product.name, image: product.image, category: product.category, description: product.description , id: product.id, stock: product.stock }];

            await setDoc(cartRef, { items: newCartItems });
            console.log("🚀 ~ updateCart ~ newCartItems:", newCartItems)
        }


    } else {
        // User is a guest, update localStorage
        localCart.push({ productId: product.id, quantity: quantity, price: product.price, name: product.name, image: product.image, category: product.category, description: product.description , id: product.id, stock: product.stock });
        localStorage.setItem('cart', JSON.stringify(localCart));
        updateCartUI(localCart);
    }

    showNotification(`${product.name} added to cart!`);
}

export async function updateItemQuantity(productId, quantity) {

    let product = await fetchProductById(productId);

    if (product.stock < quantity) {
        showNotification(`${product?.name || "Product"} is out of stock`, "danger");

        console.log("Product is out of stock");
        return;
    }

    const user = auth.currentUser;

    if (user) {
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);
        const cartItems = cartSnap.exists() ? cartSnap.data().items : [];

        const updatedCartItems = cartItems.map(item => {
            if (item.productId === productId) {
                return { ...item, quantity };
            }
            return item;
        });



        await updateDoc(cartRef, { items: updatedCartItems });

        showNotification(`Item quantity updated!`);
    } else {
        const cart = localStorage.getItem('cart');
        const updatedCart = JSON.parse(cart).map(item => {
            if (item.productId === productId) {
                return { ...item, quantity };
            }
            return item;
        });
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        showNotification(`Item quantity updated!`);
        updateCartUI(updatedCart);
    }
}



export async function removeItemFromCart(productId) {
    const user = auth.currentUser;

    if (user) {
        const cartRef = doc(db, "carts", user.uid);
        const newCartItems = localCart.filter(item => item.productId !== productId);

        await setDoc(cartRef, { items: newCartItems });
    } else {

        localCart = localCart.filter(item => item.productId !== productId);
        localStorage.setItem('cart', JSON.stringify(localCart));
        updateCartUI(localCart);
    }

    showNotification(`Item removed from cart!`);
}

function updateCartUI(cart) {
    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
    const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
    if (cartLink) {
        cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
    }
}

export async function clearCart() {
    const user = auth.currentUser;
    if (user) {
        const cartRef = doc(db, "carts", user.uid);
        await setDoc(cartRef, { items: [] });
    } else {
        localStorage.removeItem('cart');
        updateCartUI([]);
    }
    showNotification(`Cart cleared!`);
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
