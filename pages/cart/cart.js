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
    const cartIcon = document.getElementById("cart-item-count");
    if (cartIcon) {
        const count = getCartItemCount();
        cartIcon.textContent = count;
        cartIcon.style.display = count > 0 ? "flex" : "none";
    }
}

function addProductToCart(product, quantity = 1) {
    let cart = getCart();
    const existingItem = cart.find((item) => item.id === product.id);

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

function removeProductFromCart(productId) {
    let cart = getCart();
    const itemToRemove = cart.find((item) => item.id === productId);
    const updatedCart = cart.filter((item) => item.id !== productId);
    saveCart(updatedCart);
    if (itemToRemove) {
        showNotification(`${itemToRemove.name} Deleted from Cart.`, "danger");
    }
}

function updateProductQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemToUpdate = cart.find((item) => item.id === productId);
    if (itemToUpdate) {
        itemToUpdate.quantity = newQuantity;
    }
    saveCart(cart);
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
            productIdToDelete = parseInt(event.target.dataset.id);
            const modal = new bootstrap.Modal(
                document.getElementById("confirm-dialog")
            );
            modal.show();
        });
    });

    document.querySelectorAll(".quantity-input").forEach((input) => {
        input.addEventListener("change", (event) => {
            const productId = parseInt(event.target.dataset.id);
            const newQuantity = parseInt(event.target.value);
            if (newQuantity < 1) {
                productIdToDelete = productId;
                const modal = new bootstrap.Modal(
                    document.getElementById("confirm-dialog")
                );
                modal.show();
                renderCart();
            } else {
                updateProductQuantity(productId, newQuantity);
                renderCart();
            }
        });
    });
}

/* ---- You might like section ---- */
async function loadRelatedProducts() {
    try {
        // Simulate API call - later this will be replaced with actual API endpoint
        const mockProducts = [
            {
                id: 101,
                name: "Wireless Headphones",
                price: 59.99,
                image:
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                description:
                    "High-quality wireless headphones with noise cancellation and premium sound",
            },
            ,
            {
                id: 2,
                name: "Smart Watch",
                description:
                    "Feature-rich smartwatch with health monitoring and fitness tracking",
                price: 199.99,
                image:
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            },
            {
                id: 3,
                name: "Laptop Backpack",
                description:
                    "Durable laptop backpack with multiple compartments and water resistance",
                price: 49.99,
                image:
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
   
            },
            {
                id: 4,
                name: "Bluetooth Speaker",
                description:
                    "Portable bluetooth speaker with amazing sound quality and long battery life",
                price: 79.99,
                image:
                    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
            },
        ];

        //     try {
        // const response = await fetch('../../db.json');
        // if (!response.ok) throw new Error('Network response was not ok');
        // const data = await response.json();
        // const products = data.products.slice(0, 4);

        const container = document.getElementById("related-products-grid");
        if (!container) return;
        container.innerHTML = "";

        mockProducts.forEach((product) => {
            const productCard = document.createElement("div");
            productCard.className = "col";
            productCard.innerHTML = `
                        <div class="card h-100 product-card">
                            <img src="${product.image
                }" class="card-img-top product-img" alt="${product.name
                }">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text flex-grow-1">${product.description
                }</p>
                                <p class="card-text fw-bold fs-5">${product.price.toFixed(
                    2
                )} EGP</p>
                                <button class="btn btn-outline-primary-custom add-to-cart-btn" 
                                    data-id="${product.id}"
                                    data-name="${product.name}"
                                    data-price="${product.price}"
                                    data-image="${product.image}"
                                    data-description="${product.description}">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    `;
            container.appendChild(productCard);
        });

        attachRelatedProductsListeners();
    } catch (error) {
        console.error("Failed to load related products:", error);
        const container = document.getElementById("related-products-grid");
        if (container)
            container.innerHTML =
                "<p class='text-center text-danger col-12'>Could not load related products.</p>";
    }
}

function attachRelatedProductsListeners() {
    document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            const productData = event.target.dataset;
            const product = {
                id: parseInt(productData.id),
                name: productData.name,
                price: parseFloat(productData.price),
                image: productData.image,
                description: productData.description,
            };
            addProductToCart(product);
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
    loadRelatedProducts();
});