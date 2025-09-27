/* --- Firebase Imports --- */
import { auth, db } from "../../config/firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

/* --- Globals --- */
let currentUser = null;

/* --- Main Functions --- */
function showNotification(message, type = "success") {
    const container = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
        notification.classList.remove("show");
        notification.classList.add("hiding");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getCart() {
    const cartJson = localStorage.getItem("cart");
    return cartJson ? JSON.parse(cartJson) : [];
}

async function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartIcon();

    if (currentUser) {
        const cartQuery = doc(db, "users", currentUser.uid, "cart", "cart");
        await setDoc(cartQuery, { items: cart });
    }
}

function getCartItemCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

function updateCartIcon() {
    const cartCount = getCartItemCount();
    const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
    if (cartLink) {
        cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
    }
}

/* --- Firestore Helpers --- */
async function getProductData(productId) {
    try {
        const productQuery = doc(db, "products", productId);
        const result = await getDoc(productQuery);
        return result.exists() ? { id: result.id, ...result.data() } : null;
    } catch {
        return null;
    }
}

async function getProductStock(productId) {
    const product = await getProductData(productId);
    return product ? product.stock || 0 : 0;
}

/* --- Cart Actions --- */
async function addProductToCart(productId, quantity = 1) {
    let cart = getCart();
    const existingItem = cart.find((item) => item.id == productId);

    const stock = await getProductStock(productId);
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + quantity > stock) {
        showNotification(`Sorry, only ${stock} items available.`, "danger");
        return;
    }

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity });
    }
    await saveCart(cart);
    showNotification(`Product added to Cart.`, "success");

    if (document.getElementById("cart-items-container")) {
        renderCart();
    }
}

async function updateProductQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemToUpdate = cart.find((item) => item.id == productId);
    let finalQty = newQuantity;

    if (itemToUpdate) {
        const stock = await getProductStock(productId);

        if (newQuantity > stock) {
            showNotification(`No more than ${stock} can be added!`, "danger");
            finalQty = stock;
        }

        itemToUpdate.quantity = finalQty;
        await saveCart(cart);
        return finalQty; 
    }
    return null;
}


async function removeProductFromCart(productId) {
    let cart = getCart();
    const updatedCart = cart.filter((item) => item.id != productId);
    await saveCart(updatedCart);

    showNotification(`Item removed from Cart.`, "danger");
}

/* --- Subtotal --- */
async function getCartSubtotal() {
    let subtotal = 0;
    for (const item of getCart()) {
        const product = await getProductData(item.id);
        if (product) subtotal += (product.price || 0) * item.quantity;
    }
    return subtotal;
}

/* --- Page Logic --- */
const SHIPPING_COST = 50.0;
let cartContainer, cartSubtotal, cartShipping, cartTotal, confirmDialog, confirmDeleteBtn, confirmCancelBtn;
let productIdToDelete = null;

async function renderCart() {
    const items = getCart();
    cartContainer.innerHTML = "";

    if (items.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="bi bi-basket empty-cart-icon"></i>
                <h2 class="h4 mt-3">Your Cart is Empty</h2>
                <p class="text-muted mt-2">Looks like you haven't added anything to your cart yet.</p>
                <a href="../products/products.html" class="btn btn-primary-custom mt-3">Start Shopping</a>
            </div>`;
    } else {
        for (const item of items) {
            const product = await getProductData(item.id);
            if (!product) continue;

            const itemEl = document.createElement("div");
            itemEl.className = "cart-item row";
            itemEl.innerHTML = `
                <div class="col-12 col-sm-3 text-center mb-3 mb-sm-0">
                    <img src="${product.image || ""}" alt="${product.name}" class="cart-item-img">
                </div>
                <div class="col-12 col-sm-5 text-center text-sm-start">
                    <h3 class="h5 fw-bold">${product.name}</h3>
                    <p class="text-muted small">${product.description || "No description available."}</p>
                    <div class="d-flex align-items-center justify-content-center justify-content-sm-start mt-2">
                        <span class="fw-medium me-2">Quantity:</span>
                        <input type="number" class="form-control quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    </div>
                </div>
                <div class="col-12 col-sm-4 text-center text-sm-end">
                    <p class="fw-bold fs-5">${((product.price || 0) * item.quantity).toFixed(2)} EGP</p>
                    <button class="btn btn-link text-danger p-0 remove-btn" data-id="${item.id}">Remove</button>
                </div>`;
            cartContainer.appendChild(itemEl);
        }
    }

    await updateSummary();
    attachCartEventListeners();
}

async function updateSummary() {
    const subtotal = await getCartSubtotal();
    const shipping = subtotal > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;
    cartSubtotal.textContent = `${subtotal.toFixed(2)} EGP`;
    cartShipping.textContent = `${shipping.toFixed(2)} EGP`;
    cartTotal.textContent = `${total.toFixed(2)} EGP`;
}

function attachCartEventListeners() {
    document.querySelectorAll(".remove-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault(); 
            productIdToDelete = event.target.dataset.id;
            new bootstrap.Modal(document.getElementById("confirm-dialog")).show();
        });
    });

document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", async (event) => {
        event.preventDefault();
        const productId = event.target.dataset.id;
        const newQuantity = parseInt(event.target.value);

        if (newQuantity < 1) {
            productIdToDelete = productId;
            new bootstrap.Modal(document.getElementById("confirm-dialog")).show();
        } else {
            const actualQty = await updateProductQuantity(productId, newQuantity);
            if (actualQty !== null) {
                event.target.value = actualQty;

                const itemRow = event.target.closest(".cart-item");
                const cart = getCart();
                const item = cart.find((i) => i.id == productId);
                if (item && itemRow) {
                    const priceEl = itemRow.querySelector("p.fw-bold.fs-5");
                    if (priceEl) {
                        priceEl.textContent = `${(item.price * item.quantity).toFixed(2)} EGP`;
                    }
                }

                updateSummary();
            }
        }
    });
});

}
/* --- Initialize the Page --- */
document.addEventListener("DOMContentLoaded", () => {
    cartContainer = document.getElementById("cart-items-container");
    cartSubtotal = document.getElementById("summary-subtotal");
    cartShipping = document.getElementById("summary-shipping");
    cartTotal = document.getElementById("summary-total");
    confirmDialog = document.getElementById("confirm-dialog");
    confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    confirmCancelBtn = document.getElementById("confirm-cancel-btn");

    confirmDeleteBtn.addEventListener("click", async () => {
        if (productIdToDelete !== null) {
            await removeProductFromCart(productIdToDelete);
            productIdToDelete = null;

            bootstrap.Modal.getInstance(confirmDialog).hide();
            renderCart();
        }
    });

    confirmCancelBtn.addEventListener("click", () => {
        productIdToDelete = null;
        bootstrap.Modal.getInstance(document.getElementById("confirm-dialog")).hide();
    });
//-------------------- Cart Sync ---------------------------------------//
onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;

    if (currentUser) {
        const cartQuery = doc(db, "users", currentUser.uid, "cart", "cart");
        const result = await getDoc(cartQuery);

        if (result.exists() && result.data().items && result.data().items.length > 0) {
            const firestoreCart = result.data().items;
            localStorage.setItem("cart", JSON.stringify(firestoreCart));
        } else {
            const localCart = getCart();
            await setDoc(cartQuery, { items: localCart });
        }
    } else {
        currentUser = null;
    }

    renderCart();
    updateCartIcon();
    updateWishlistCount();
});
});

/* --- Wishlist --- */
function updateWishlistCount() {
    const count = getWishlist().length;
    const countEl = document.getElementById("wishlist-count");
    if (countEl)
        countEl.innerHTML = `<i class="fas fa-heart me-2"></i>${count} ${count === 1 ? "item" : "items"}`;

    const navWishlist = document.querySelector('.navbar .nav-link[href*="wishlist"]');
    if (navWishlist) {
        navWishlist.innerHTML = `Wishlist (${count}) <i class="fas fa-heart"></i>`;
    }
}

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
        return [];
    }
}
//-------------------- Stock Validation ---------------------------------------//
async function mergeLocalCartToFirestore() {
    const localCart = getCart();
    const cartQuery = doc(db, "users", currentUser.uid, "cart", "cart");
    const result = await getDoc(cartQuery);
    const firestoreCart = result.exists() ? result.data().items || [] : [];

    const cartMap = new Map();

    for (const item of firestoreCart) {
        cartMap.set(item.id, item.quantity);
    }

    for (const item of localCart) {
        const stock = await getProductStock(item.id);
        const currentQty = cartMap.get(item.id) || 0;
        const newQty = Math.min(currentQty + item.quantity, stock);
        cartMap.set(item.id, newQty);
    }

    const mergedCart = Array.from(cartMap, ([id, quantity]) => ({ id, quantity }));

    await setDoc(cartQuery, { items: mergedCart });
    localStorage.setItem("cart", JSON.stringify(mergedCart));
}