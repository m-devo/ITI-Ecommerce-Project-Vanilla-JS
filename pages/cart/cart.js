/* --- Main Functions ---*/
function showNotification(message, type = "success") {
    const container = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);

    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show");
        notification.classList.add("hiding");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getCart() {
    const cartJson = localStorage.getItem("cart");
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartIcon();
}

function getCartItemCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

function updateCartIcon() {
    const cartCount = getCart().reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
    if (cartLink) {
        cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
    }
}
function addProductToCart(product, quantity = 1) {
    let cart = getCart();

    const existingItem = cart.find((item) => item.id == product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        product.quantity = quantity;
        cart.push(product);
    }
    saveCart(cart);
    showNotification(`${product.name} Added to Cart.`, "success");

    if (document.getElementById("cart-items-container")) {
        renderCart();
    }
}

function updateProductQuantity(productId, newQuantity) {
    let cart = getCart();

    const itemToUpdate = cart.find((item) => item.id == productId);
    if (itemToUpdate) {
        itemToUpdate.quantity = newQuantity;
    }
    saveCart(cart);
}

function removeProductFromCart(productId) {
    let cart = getCart();
    const itemToRemove = cart.find((item) => item.id == productId);

    const updatedCart = cart.filter((item) => item.id != productId);
    saveCart(updatedCart);
    if (itemToRemove) {
        showNotification(`${itemToRemove.name} Deleted from Cart.`, "danger");
    }
}

function getCartSubtotal() {
    return getCart().reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
}

// turning

/* --- page logic --- */
const SHIPPING_COST = 50.0;
let cartContainer,
    subtotalEl,
    shippingEl,
    totalEl,
    confirmDialog,
    confirmDeleteBtn,
    confirmCancelBtn;
let productIdToDelete = null;

function renderCart() {
    const items = getCart();
    cartContainer.innerHTML = ""; // remove all and start from beginning

    if (items.length === 0) {
        cartContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="bi bi-basket empty-cart-icon"></i>
                        <h2 class="h4 mt-3">Your Cart is Empty</h2>
                        <p class="text-muted mt-2">Looks like you haven't added anything to your cart yet.</p>
                        <a href="../products/products.html" class="btn btn-primary-custom mt-3">Start Shopping</a>
                    </div>
                `;
    } else {
        items.forEach((item) => {
            const itemEl = document.createElement("div");
            itemEl.className = "cart-item row";
            itemEl.innerHTML = `
                        <div class="col-12 col-sm-3 text-center mb-3 mb-sm-0">
                            <img src="${item.image}" alt="${item.name
                }" class="cart-item-img">
                        </div>
                        <div class="col-12 col-sm-5 text-center text-sm-start">
                            <h3 class="h5 fw-bold">${item.name}</h3>
                            <p class="text-muted small">${item.description || "No description available."
                }</p>
                            <div class="d-flex align-items-center justify-content-center justify-content-sm-start mt-2">
                                <span class="fw-medium me-2">Quantity:</span>
                                <input type="number" class="form-control quantity-input" value="${item.quantity
                }" min="1" data-id="${item.id}">
                            </div>
                        </div>
                        <div class="col-12 col-sm-4 text-center text-sm-end">
                            <p class="fw-bold fs-5">${(
                    item.price * item.quantity
                ).toFixed(2)} EGP</p>
                            <button class="btn btn-link text-danger p-0 remove-btn" data-id="${item.id
                }">Remove</button>
                        </div>
                    `;
            cartContainer.appendChild(itemEl);
        });
    }

    updateSummary();
    attachCartEventListeners();
}

function updateSummary() {
    const subtotal = getCartSubtotal();
    const shipping = subtotal > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;
    subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
    shippingEl.textContent = `${shipping.toFixed(2)} EGP`;
    totalEl.textContent = `${total.toFixed(2)} EGP`;
}
function attachCartEventListeners() {
    document.querySelectorAll(".remove-btn").forEach((button) => {
        button.addEventListener("click", (event) => {

            productIdToDelete = event.target.dataset.id;
            const modal = new bootstrap.Modal(
                document.getElementById("confirm-dialog")
            );
            modal.show();
        });
    });

    document.querySelectorAll(".quantity-input").forEach((input) => {
        input.addEventListener("change", (event) => {

            const productId = event.target.dataset.id; 
            const newQuantity = parseInt(event.target.value);
            if (newQuantity < 1) {
                productIdToDelete = productId;
                const modal = new bootstrap.Modal(
                    document.getElementById("confirm-dialog")
                );
                modal.show();
            } else {
                updateProductQuantity(productId, newQuantity);
                renderCart();
            }
        });
    });
}

/* --- initialize the page ---*/
document.addEventListener("DOMContentLoaded", () => {
    cartContainer = document.getElementById("cart-items-container");
    subtotalEl = document.getElementById("summary-subtotal");
    shippingEl = document.getElementById("summary-shipping");
    totalEl = document.getElementById("summary-total");
    confirmDialog = document.getElementById("confirm-dialog");
    confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    confirmCancelBtn = document.getElementById("confirm-cancel-btn");

    confirmDeleteBtn.addEventListener("click", () => {
        if (productIdToDelete !== null) {
            removeProductFromCart(productIdToDelete);
            productIdToDelete = null;
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("confirm-dialog")
            );
            modal.hide();
            renderCart();
        }
    });

    confirmCancelBtn.addEventListener("click", () => {
        productIdToDelete = null;
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("confirm-dialog")
        );
        modal.hide();
    });

    renderCart();
    updateCartIcon();
    updateWishlistCount();
});

function updateWishlistCount() {
  const count = getWishlist().length;
  const countEl = document.getElementById("wishlist-count");
  if (countEl)
    countEl.innerHTML = `<i class="fas fa-heart me-2"></i>${count} ${
      count === 1 ? "item" : "items"
    }`;

  const navWishlist = document.querySelector(
    '.navbar .nav-link[href*="wishlist"]'
  );
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
