import { fetchFeaturedProducts } from "../../data/products.js";
import { updateCart } from "../../data/cart.js";

let featuredProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const productsContainer = document.getElementById("products-container");

document.addEventListener("DOMContentLoaded", function () {
  displayFeaturedProducts();
  // updateCartUI();
  updateWishlistCount();
  updateWishlistButtonStates();

  window.addEventListener("wishlist:updated", function () {
    updateWishlistCount();
    updateWishlistButtonStates();
  });
});

function updateWishlistButtonStates() {
  if (typeof window.isInWishlist === "function") {
    const buttons = document.querySelectorAll(".wishlist-btn");
    buttons.forEach((btn) => {
      const onclick = btn.getAttribute("onclick");
      if (onclick) {
        const match = onclick.match(/id:\s*'([^']+)'/);
        if (match) {
          const productId = match[1];
          btn.classList.toggle("active", window.isInWishlist(productId));
        }
      }
    });
  }
}

async function displayFeaturedProducts() {
  featuredProducts = await fetchFeaturedProducts();

  if (!featuredProducts || featuredProducts.length === 0) {
    return;
  }

  productsContainer.innerHTML = featuredProducts
    .map(
      (product) => `
    <div class="col-md-6 col-lg-4">
      <div class="product-card" onclick="viewProductDetails('${product.id}')">
        <div class="position-relative">
          <img src="${product.image}" alt="${
        product.name
      }" class="product-image">
          <button class="wishlist-btn position-absolute top-0 end-0 m-2" title="Add to wishlist" onclick="event.stopPropagation(); toggleWishlistSafely({ id: '${
            product.id
          }', name: '${product.name.replace(/'/g, "&#39;")}', price: ${
        product.price
      }, image: '${product.image.replace(/'/g, "&#39;")}', rating: ${
        product.rating
      } }, this);">
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
              ${
                product.stock > 0
                  ? `${product.stock} left`
                  : '<span class="text-danger">Out of stock</span>'
              }
            </div>
          </div>
          <div class="quantity-controls" onclick="event.stopPropagation()">
            <button class="quantity-btn" ${
              product.stock === 0 ? "disabled" : ""
            } onclick="decreaseQuantity('${product.id}')">-</button>
            <input type="number" class="quantity-input" id="qty-${
              product.id
            }" value="1" min="1" max="${product.stock}" ${
        product.stock === 0 ? "disabled" : ""
      }>
            <button class="quantity-btn" ${
              product.stock === 0 ? "disabled" : ""
            } onclick="increaseQuantity('${product.id}')">+</button>
          </div>
          <button class="add-to-cart-btn" ${
            product.stock === 0 ? "disabled" : ""
          } onclick="event.stopPropagation(); addToCart('${product.id}')">
            <i class="fas fa-shopping-cart"></i> ${
              product.stock === 0 ? "Out of Stock" : "Add to Cart"
            }
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  updateWishlistButtonStates();
}

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

window.increaseQuantity = function (productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  const product = featuredProducts.find((p) => p.id == productId);

  if (product && parseInt(qtyInput.value) < product.stock) {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  }
};

window.decreaseQuantity = function (productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);

  if (parseInt(qtyInput.value) > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
};

window.addToCart = async function (productId) {
  const product = featuredProducts.find((p) => p.id == productId);
  if (!product) return;
  if (!product.stock || product.stock <= 0) {
    showNotification(`${product?.name || "Product"} is out of stock`);
    return;
  }
  const qtyInput = document.getElementById(`qty-${productId}`);
  const quantity = parseInt(qtyInput?.value || 1);

  await updateCart(productId, quantity);
};

// function updateCartUI() {
//   const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
//   const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
//   if (cartLink) {
//     cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
//   }
// }

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "alert alert-success position-fixed";
  notification.style.cssText =
    "top: 70px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i> ${message}
    <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

window.viewProductDetails = function (productId) {
  window.location.href = `./pages/product-details/product-details.html?id=${productId}`;
};

function updateWishlistCount() {
  const count = window.getWishlist ? window.getWishlist().length : 0;
  const countEl = document.getElementById("wishlist-count");
  if (countEl) {
    countEl.innerHTML = `<i class="fas fa-heart me-2"></i>${count} ${
      count === 1 ? "item" : "items"
    }`;
  }

  const navWishlist = document.querySelector(
    '.navbar .nav-link[href*="wishlist"]'
  );
  if (navWishlist) {
    navWishlist.innerHTML = `Wishlist (${count}) <i class="fas fa-heart"></i>`;
  }
}

window.toggleWishlistSafely = function (product, buttonElement) {
  if (
    typeof window.toggleWishlist === "function" &&
    typeof window.isInWishlist === "function"
  ) {
    window.toggleWishlist(product);
    buttonElement.classList.toggle("active", window.isInWishlist(product.id));
    updateWishlistCount();
  }
};

window.cart = cart;
