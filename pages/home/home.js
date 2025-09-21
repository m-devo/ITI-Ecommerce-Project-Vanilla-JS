import { fetchFeaturedProducts } from "../../data/products.js";

let featuredProducts = [];

// Shopping cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// DOM elements
const productsContainer = document.getElementById("products-container");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  displayFeaturedProducts();
  updateCartUI();

  updateWishlistCount();
});


// Display featured products (first 9)
async function displayFeaturedProducts() {

  featuredProducts = await fetchFeaturedProducts();



  console.log(featuredProducts);


  productsContainer.innerHTML = featuredProducts
    .map(
      (product) => `
    <div class="col-md-6 col-lg-4">
      <div class="product-card" onclick="viewProductDetails('${product.id}')">
        <div class="position-relative">
          <img src="${product.image}" alt="${
        product.name
      }" class="product-image">
          <button class="wishlist-btn position-absolute top-0 end-0 m-2" title="Add to wishlist" onclick="event.stopPropagation(); toggleWishlist({ id: ${
            product.id
          }, name: '${product.name.replace(/'/g, "&#39;")}', price: ${
        product.price
      }, image: '${product.image.replace(/'/g, "&#39;")}', rating: ${
        product.rating
      } }); this.classList.toggle('active', isInWishlist(${product.id}));">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="product-info">
          <h5 class="product-title">${product.name}</h5>
          <p class="product-description">${product.description}</p>
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <div class="product-meta">
            <div class="product-rating">
              ${generateStars(product.rating)} (${product.rating})
            </div>
            <div class="product-stock">
              ${product.stock} left
            </div>
          </div>
          <div class="quantity-controls" onclick="event.stopPropagation()">
            <button class="quantity-btn" onclick="decreaseQuantity(${
              product.id
            })">-</button>
            <input type="number" class="quantity-input" id="qty-${
              product.id
            }" value="1" min="1" max="${product.stock}">
            <button class="quantity-btn" onclick="increaseQuantity(${
              product.id
            })">+</button>
          </div>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${
            product.id
          })">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  try {
    const buttons = productsContainer.querySelectorAll(".wishlist-btn");
    buttons.forEach((btn) => {
      const match = btn.getAttribute("onclick");
      const idMatch = match && match.match(/isInWishlist\((\d+)\)/);
      const id = idMatch ? parseInt(idMatch[1]) : null;
      if (id && typeof isInWishlist === "function") {
        btn.classList.toggle("active", isInWishlist(id));
      }
    });
  } catch {}
}

// Generate  rating
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "";

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }

  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }

  return stars;
}

// --- START OF MODIFICATIONS ---
// Attach functions to the window object to make them global

// Quantity controls
window.increaseQuantity = function(productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  const product = products.find((p) => p.id === productId);

  if (parseInt(qtyInput.value) < product.stock) {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  }
}

window.decreaseQuantity = function(productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);

  if (parseInt(qtyInput.value) > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
}

// Add to cart functionality
window.addToCart = function(productId) {
  const product = featuredProducts.find((p) => p.id === productId);
  const qtyInput = document.getElementById(`qty-${productId}`);
  const quantity = parseInt(qtyInput.value);

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity: quantity,
    });
  }

  // Reset quantity input
  qtyInput.value = 1;

  localStorage.setItem("cart", JSON.stringify(cart));

  // Update cart UI
  updateCartUI();

  // Show success message
  showNotification(`${product.name} added to cart!`);
}

// View product details
window.viewProductDetails = function(productId) {
  // Store the selected product ID for the details page
  localStorage.setItem("selectedProductId", productId);
  // Navigate to product details page
  window.location.href = "./product-details.html";
}

// --- END OF MODIFICATIONS ---


// Update cart UI
function updateCartUI() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Update cart count in navbar
  const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
  if (cartLink) {
    cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "alert alert-success position-fixed";
  notification.style.cssText =
    "top: 100px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i> ${message}
    <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// View product details
window.viewProductDetails = function(productId) {
  window.location.href = "./pages/product-details/product-details.html?id=" + productId;
}


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



window.cart = cart;