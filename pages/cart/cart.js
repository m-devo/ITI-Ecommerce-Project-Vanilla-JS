/* --- Main Functions ---*/
function showNotification(message, type = "success") {
    const container = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    setTimeout(() => {
        notification.classList.add("hiding");
        notification.addEventListener("transitionend", () => notification.remove());
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
    cartContainer.innerHTML = ""; // remove all <<< and start from begining

    if (items.length === 0) {
        cartContainer.innerHTML = `
                    <div class="text-center p-8 border-2 border-dashed rounded-lg">
                        <i data-lucide="shopping-basket" class="w-16 h-16 mx-auto text-gray-300"></i>
                        <h2 class="mt-4 text-xl font-semibold text-gray-700">Your Cart is Empty</h2>
                        <p class="mt-2 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
                        <a href="../products/products.html" class="mt-6 inline-block bg-emerald-600 text-white font-bold py-2 px-5 rounded-lg shadow hover:bg-emerald-700 transition"> Start Shopping
                        </a>
                    </div>
                `;
    } else {
        items.forEach((item) => {
            const itemEl = document.createElement("div");
            itemEl.className =
                "flex flex-col sm:flex-row items-center gap-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0";
            itemEl.innerHTML = `
                        <img src="${item.image}" alt="${item.name
                }" class="w-28 h-28 object-cover rounded-lg flex-shrink-0">
                        <div class="flex-grow text-center sm:text-left">
                            <h3 class="font-bold text-lg text-gray-800">${item.name
                }</h3>
                            <p class="text-sm text-gray-500 mt-1">${item.description || "No description available."
                }</p>
                            <div class="flex items-center justify-center sm:justify-start mt-3">
                                <span class="font-semibold text-gray-600">Quantity:</span>
                                <input type="number" class="quantity-input ml-2 w-16 text-center border rounded-md focus:ring-2 focus:ring-emerald-300" value="${item.quantity
                }" min="1" data-id="${item.id}"> </div>
                        </div>
                        <div class="text-center sm:text-right">
                            <p class="font-bold text-lg text-gray-900">${(
                    item.price * item.quantity
                ).toFixed(2)} EGP</p>
                            <button class="remove-btn text-red-500 hover:text-red-700 text-sm font-medium mt-2" data-id="${item.id
                }">Remove</button>
                        </div>
                    `;
            cartContainer.appendChild(itemEl);
        });
    }

    updateSummary();
    attachCartEventListeners();
    lucide.createIcons();
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
            confirmDialog.showModal();
        });
    });
    document.querySelectorAll(".quantity-input").forEach((input) => {
        input.addEventListener("change", (event) => {
            const productId = parseInt(event.target.dataset.id);
            const newQuantity = parseInt(event.target.value);
            if (newQuantity < 1) {
                productIdToDelete = productId;
                confirmDialog.showModal();
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
        const response = await fetch("../../db.json");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        const products = data.products.slice(0, 4);

        const container = document.getElementById("related-products-grid");
        if (!container) return;
        container.innerHTML = "";

        products.forEach((product) => {
            const productCard = document.createElement("div");
            productCard.className =
                "bg-white rounded-lg shadow-md overflow-hidden group";
            productCard.innerHTML = `
                        <div class="relative">
                            <img src="${product.image}" alt="${product.name
                }" class="w-full h-48 object-cover transition-transform group-hover:scale-105">
                        </div>
                        <div class="p-4 flex flex-col">
                            <h4 class="font-bold text-gray-800 truncate flex-grow">${product.name
                }</h4>
                            <p class="text-lg font-semibold text-gray-900 mt-2">${product.price.toFixed(
                    2
                )} EGP</p>
                            <button class="add-to-cart-btn w-full mt-4 border-2 border-emerald-600 text-emerald-600 font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 hover:text-white transition" data-id="${product.id
                }"
                                    data-name="${product.name}"
                                    data-price="${product.price}"
                                    data-image="${product.image}"
                                    data-description="${product.description || ""
                }">
                                Add to Cart
                            </button>
                        </div>
                    `;
            container.appendChild(productCard);
        });

        attachRelatedProductsListeners();
        lucide.createIcons();
    } catch (error) {
        console.error("Failed to load related products:", error);
        const container = document.getElementById("related-products-grid");
        if (container)
            container.innerHTML =
                "<p class='text-center text-red-500 col-span-4'>Could not load related products.</p>";
    }
}

function attachRelatedProductsListeners() {
    document
        .querySelectorAll("#related-products-grid .add-to-cart-btn")
        .forEach((button) => {
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

/* --- intialize the page ---*/
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
            confirmDialog.close();
            renderCart();
        }
    });

    confirmCancelBtn.addEventListener("click", () => {
        productIdToDelete = null;
        confirmDialog.close();
    });

    renderCart();
    updateCartIcon();
    loadRelatedProducts();
});
