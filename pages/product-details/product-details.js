// Product details
import { fetchProductById, fetchAllProducts } from "../../data/products.js";
import { updateCart } from "../../data/cart.js";

let product = null;
let productId = null;
let currentCart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", function () {
  loadProductDetails();
  updateWishlistCount();
  // updateCartUI();

  window.addEventListener("wishlist:updated", updateWishlistCount);
});

async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  productId = params.get("id");
  product = await fetchProductById(productId);
  document.getElementById("breadcrumb-product").textContent = product.name;

  document.getElementById("product-detail-content").innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <div class="product-image-container">
          <img src="${product.image}" alt="${
    product.name
  }" class="img-fluid rounded-3 product-main-image">
        </div>
      </div>
      <div class="col-md-6">
        <div class="product-details-info">
          <h1 class="display-5 fw-bold mb-3">${product.name}</h1>
          
          <div class="product-rating mb-3">
            ${generateStars(product.rating)} 
            <span class="text-muted ms-2">(${product.rating}/5.0)</span>
          </div>
          
          <div class="product-price mb-4">
            <span class="h2 text-primary fw-bold">$${product.price.toFixed(
              2
            )}</span>
          </div>
          
          <div class="product-description mb-4">
            <h5>Description</h5>
            <p class="text-muted">${product.description}</p>
          </div>
          
          <div class="product-details mb-4">
            <h5>Product Details</h5>
            <ul class="list-unstyled">
              <li><strong>Category:</strong> ${getCategoryName(
                product.category
              )}</li>
              <li><strong>Stock:</strong> <span class="text-${
                product.stock > 10
                  ? "success"
                  : product.stock > 0
                  ? "warning"
                  : "danger"
              }">${
    product.stock > 0 ? `${product.stock} items available` : "Out of stock"
  }</span></li>
              <li><strong>SKU:</strong> PRD-${product.id
                .toString()
                .padStart(4, "0")}</li>
            </ul>
          </div>
          
          <div class="product-actions">
            <div class="quantity-controls mb-3 d-flex align-items-center gap-3">
              <label for="detail-qty" class="form-label">Quantity:</label>
              <div class="d-flex">
                <button class="quantity-btn" ${
                  product.stock === 0 ? "disabled" : ""
                } onclick="decreaseDetailQuantity()">-</button>
                <input type="number" class="quantity-input" id="detail-qty" value="1" min="1" max="${
                  product.stock
                }" ${product.stock === 0 ? "disabled" : ""}>
                <button class="quantity-btn" ${
                  product.stock === 0 ? "disabled" : ""
                } onclick="increaseDetailQuantity()">+</button>
              </div>
            </div>
            
            <div class="d-grid gap-2 d-md-block">
              <button class="btn btn-primary btn-lg" ${
                product.stock === 0 ? "disabled" : ""
              } onclick="addToCartFromDetails()">
                <i class="fas fa-shopping-cart"></i> ${
                  product.stock === 0 ? "Out of Stock" : "Add to Cart"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  loadRelatedProducts(product);
}

window.increaseDetailQuantity = function () {
  const qtyInput = document.getElementById("detail-qty");
  const maxStock = parseInt(qtyInput.max);

  if (parseInt(qtyInput.value) < maxStock) {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  }
};

window.decreaseDetailQuantity = function () {
  const qtyInput = document.getElementById("detail-qty");

  if (parseInt(qtyInput.value) > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
};

window.addToCartFromDetails = async function () {
  const qtyInput = document.getElementById("detail-qty");
  const quantity = parseInt(qtyInput.value) || 1;
  await updateCart(product.id, quantity);
  qtyInput.value = 1;
};

async function loadRelatedProducts(currentProduct) {
  try {
    const productsData = await fetchAllProducts({
      category: currentProduct.category,
      limitPerPage: 5,
    });
    const allProductsList = productsData.products || [];

    const relatedProducts = allProductsList
      .filter(
        (p) =>
          p.category === currentProduct.category && p.id !== currentProduct.id
      )
      .slice(0, 4);

    const container = document.getElementById("related-products-container");
    if (!container) return;

    if (relatedProducts.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center"><p class="text-muted">No related products found.</p></div>';
      return;
    }

    container.innerHTML = relatedProducts
      .map(
        (product) => `
        <div class="col-md-6 col-lg-3">
          <div class="product-card" onclick="viewProductDetails('${
            product.id
          }')">
            <img src="${product.image}" alt="${
          product.name
        }" class="product-image">
            <div class="product-info">
              <h6 class="product-title">${product.name}</h6>
              <div class="product-price">$${product.price.toFixed(2)}</div>
              <div class="product-rating">
                ${generateStars(product.rating)} (${product.rating})
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");
  } catch (error) {
    const container = document.getElementById("related-products-container");
    if (container) {
      container.innerHTML =
        '<div class="col-12 text-center"><p class="text-muted">Error loading related products.</p></div>';
    }
  }
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "";

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star text-warning"></i>';
  }

  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt text-warning"></i>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star text-warning"></i>';
  }

  return stars;
}

function getCategoryName(category) {
  const categories = {
    electronics: "Electronics",
    audio: "Audio",
    accessories: "Accessories",
  };
  return categories[category] || category;
}

function addToCart(productId, quantity = 1) {
  if (!product || !product.stock || product.stock <= 0) {
    showNotification(`${product?.name || "Product"} is out of stock`);
    return;
  }
  const existingItem = currentCart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    currentCart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(currentCart));
  updateCartUI();
  showNotification(`${product.name} added to cart!`);
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "alert alert-success position-fixed";
  notification.style.cssText =
    "top: 70px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i> ${message}
    <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>`;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// function updateCartUI() {
//   const cartCount = currentCart.reduce(
//     (total, item) => total + item.quantity,
//     0
//   );
//   const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');

//   if (cartLink) {
//     cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
//   }
// }

function updateWishlistCount() {
  try {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const count = wishlist.length;

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
  } catch (error) {
    console.warn("Error updating wishlist count:", error);
  }
}

window.viewProductDetails = function (productId) {
  window.location.href = `product-details.html?id=${productId}`;
};
