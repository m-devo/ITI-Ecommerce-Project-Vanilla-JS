import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { auth } from "../../config/firebase-config.js";
import { getCart, removeItemFromCart, updateItemQuantity, syncCartOnLogin } from "../../data/cart.js";

let cartContainer, subtotalEl, shippingEl, totalEl;
const SHIPPING_COST = 50.0;
let productIdToDelete = null;

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

function renderCart(items) {
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
        items.forEach((item) => {
            const itemEl = document.createElement("div");
            itemEl.className = "cart-item row";
            itemEl.innerHTML = `
                <div class="col-12 col-sm-3 text-center mb-3 mb-sm-0">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                </div>
                <div class="col-12 col-sm-5 text-center text-sm-start">
                    <h3 class="h5 fw-bold">${item.name}</h3>
                    <p class="text-muted small">${item.description || "No description available."}</p>
                    <p class="text-muted small">Stock: ${item.stock || "Out Of Stock."}</p>
                    <div class="d-flex align-items-center justify-content-center justify-content-sm-start mt-2">
                        <span class="fw-medium me-2">Quantity:</span>
                        <input type="number" class="form-control quantity-input" value="${item.quantity}" min="1" max="${item.stock}" data-id="${item.id}">
                    </div>
                </div>
                <div class="col-12 col-sm-4 text-center text-sm-end">
                    <p class="fw-bold fs-5">${(item.price * item.quantity).toFixed(2)} EGP</p>
                    <button class="btn btn-link text-danger p-0 remove-btn" data-id="${item.id}">Remove</button>
                </div>`;
            cartContainer.appendChild(itemEl);
        });
    }

    updateSummary(items);
    attachCartEventListeners();
}

function updateSummary(items) {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;
    subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
    shippingEl.textContent = `${shipping.toFixed(2)} EGP`;
    totalEl.textContent = `${total.toFixed(2)} EGP`;
    document.getElementById("checkout-btn").disabled = items.length === 0;
}

function attachCartEventListeners() {
    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", () => {
            productIdToDelete = button.dataset.id;
            const modal = new bootstrap.Modal(document.getElementById("confirm-dialog"));
            modal.show();
        });
    });

    document.querySelectorAll(".quantity-input").forEach(input => {
        input.addEventListener("change", async (event) => {
            const productId = event.target.dataset.id;
            const newQuantity = parseInt(event.target.value);
            if (newQuantity < 1) {
                productIdToDelete = productId;
                const modal = new bootstrap.Modal(document.getElementById("confirm-dialog"));
                modal.show();
            } else {
                await updateItemQuantity(productId, newQuantity, renderCart);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    cartContainer = document.getElementById("cart-items-container");
    subtotalEl = document.getElementById("summary-subtotal");
    shippingEl = document.getElementById("summary-shipping");
    totalEl = document.getElementById("summary-total");

    updateCartIcon();
    updateWishlistCount();

    const cartItems = await getCart();
    renderCart(cartItems);

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await syncCartOnLogin(user.uid, renderCart, updateCartIcon);
        }
    });

document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
    if (productIdToDelete !== null) {
        await removeItemFromCart(productIdToDelete, renderCart);
        productIdToDelete = null;
        const modal = bootstrap.Modal.getInstance(document.getElementById("confirm-dialog"));
        modal.hide();
    }
});

    document.getElementById("confirm-cancel-btn").addEventListener("click", () => {
        productIdToDelete = null;
        const modal = bootstrap.Modal.getInstance(document.getElementById("confirm-dialog"));
        modal.hide();
    });
});

function updateCartIcon() {
    const cartCount = localStorage.getItem("cart")
        ? JSON.parse(localStorage.getItem("cart")).reduce((total, item) => total + item.quantity, 0)
        : 0;
    const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
    if (cartLink) {
        cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
    }
}

function updateWishlistCount() {
    const count = getWishlist().length;
    const countEl = document.getElementById("wishlist-count");
    if (countEl)
        countEl.innerHTML = `<i class="fas fa-heart me-2"></i>${count} ${count === 1 ? "item" : "items"}`;

    const navWishlist = document.querySelector('.navbar .nav-link[href*="wishlist"]');
    if (navWishlist) {
        const icon = '<i class="fas fa-heart"></i>';
        navWishlist.innerHTML = `Wishlist (${count}) ${icon}`;
    }
}

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
        return [];
    }
}
