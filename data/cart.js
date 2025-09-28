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
        return localCart;
    }
}

export async function syncCartOnLogin(userId, renderCartCallback, updateCartUICallback) {
    const cartRef = doc(db, "carts", userId);

    const cartSnap = await getDoc(cartRef);
    const remoteCart = cartSnap.exists() ? cartSnap.data().items : [];

    const mergedCart = mergeCarts(localCart, remoteCart);
    await setDoc(cartRef, { items: mergedCart });

    unsubscribeCartListener = onSnapshot(cartRef, (docSnap) => {
        const updatedCart = docSnap.exists() ? docSnap.data().items : [];
        localCart = updatedCart;
        renderCartCallback(updatedCart);
        updateCartUICallback(updatedCart);
    });

    localStorage.removeItem('cart');
    console.log('Cart synced with Firestore');
}

function mergeCarts(local = [], remote = []) {
    const merged = [...remote];

    local.forEach(localItem => {
        const remoteItemIndex = merged.findIndex(item => item.productId === localItem.productId);
        if (remoteItemIndex !== -1) {
            merged[remoteItemIndex].quantity = 
                Number(merged[remoteItemIndex].quantity || 0) + Number(localItem.quantity || 0);
        } else {
            merged.push({
                ...localItem,
                quantity: Number(localItem.quantity || 0),
                price: Number(localItem.price || 0)
            });
        }
    });

    return merged;
}

export async function updateCart(productId, quantity = 1) {
    const user = auth.currentUser;
    const product = await fetchProductById(productId);

    let cart = await getCart();
    const existingItem = cart.find(item => item.productId === product.id);
    let currentQuantity = existingItem ? Number(existingItem.quantity) : 0;
    quantity = currentQuantity + quantity;

    if (product.stock < quantity) {
        showNotification(`You can’t add more than ${product.stock}!`, "danger");
        return;
    }

    if (user) {
        const cartRef = doc(db, "carts", user.uid);
        const existingItemIndex = cart.findIndex(item => item.productId === product.id);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity = quantity;
        } else {
            cart.push({
                productId: product.id,
                quantity: quantity,
                price: product.price,
                name: product.name,
                image: product.image,
                category: product.category,
                description: product.description,
                id: product.id,
                stock: product.stock
            });
        }
        await setDoc(cartRef, { items: cart });
        showNotification(`${product.name} added to cart!`, "success");
    } else {
        const localItemIndex = localCart.findIndex(item => item.productId === product.id);
        if (localItemIndex !== -1) {
            localCart[localItemIndex].quantity = quantity;
        } else {
            localCart.push({
                productId: product.id,
                quantity: quantity,
                price: product.price,
                name: product.name,
                image: product.image,
                category: product.category,
                description: product.description,
                id: product.id,
                stock: product.stock
            });
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
        updateCartUI(localCart);
        showNotification(`${product.name} added to cart!`, "success");
    }
}



export async function updateItemQuantity(productId, quantity) {
    const product = await fetchProductById(productId);

    if (product.stock < quantity) {
        if (product.stock > 0) {
            showNotification(`Max quantity for "${product.name}" is ${product.stock}`, "danger");
        } else {
            showNotification(`"${product.name}" is out of stock`, "danger");
        }
        return;
    }

    const user = auth.currentUser;

    if (user) {
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);
        const cartItems = cartSnap.exists() ? cartSnap.data().items : [];

        const updatedCartItems = cartItems.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        );

        await updateDoc(cartRef, { items: updatedCartItems });
        showNotification(`Quantity for "${product.name}" updated to ${quantity}`, "success");
    } else {
        const updatedCart = localCart.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        );
        localCart = updatedCart;
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        updateCartUI(updatedCart);
        showNotification(`Quantity for "${product.name}" updated to ${quantity}`, "success");
    }
}

export async function removeItemFromCart(productId, renderCartCallback) {
    const user = auth.currentUser;
    let updatedCart = [];

    if (user) {
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);
        const currentItems = cartSnap.exists() ? cartSnap.data().items : [];
        updatedCart = currentItems.filter(item => item.productId !== productId);

        await setDoc(cartRef, { items: updatedCart });
    } else {
        updatedCart = localCart.filter(item => item.productId !== productId);
        localCart = updatedCart;
        localStorage.setItem('cart', JSON.stringify(localCart));
    }

    if (typeof renderCartCallback === "function") {
        renderCartCallback(updatedCart); 
    }

    updateCartUI(updatedCart);
    showNotification(`Item removed from cart!`, "success");
}

export async function clearCart(renderCartCallback) {
    const user = auth.currentUser;

    if (user) {
        const cartRef = doc(db, "carts", user.uid);
        await setDoc(cartRef, { items: [] });
    } else {
        localCart = [];
        localStorage.removeItem('cart');
    }

    if (typeof renderCartCallback === "function") {
        renderCartCallback([]);
    }

    updateCartUI([]);
    showNotification(`Cart cleared!`, "success");
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
    setTimeout(() => notification.remove(), 3000);
}

function updateCartUI(cart) {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
    if (cartLink) {
        cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
    }
}