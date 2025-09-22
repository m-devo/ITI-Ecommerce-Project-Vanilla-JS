import { fetchAllProducts } from "../../data/products.js";

let allProducts = [];
let currentFilters = {
  category: "",
  sort: "",
  search: "",
  lastVisible: null,
  limitPerPage: 8,
};

let currentCart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", function () {
  initProductsPage();
  updateCartUI();

  setTimeout(() => {
    updateWishlistCount();
    updateWishlistButtonStates();
  }, 100);

  window.addEventListener("wishlist:updated", function () {
    updateWishlistCount();
    updateWishlistButtonStates();
  });
});

function initProductsPage() {
  displayProducts();
  setupFilters();
  setupSearch();
}

function setupFilters() {
  const categoryFilter = document.getElementById("category-select");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      currentFilters.category = e.target.value === "all" ? "" : e.target.value;
      displayProducts();
    });
  }
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  if (searchInput && searchBtn) {
    const handleSearch = () => {
      currentFilters.search = searchInput.value.trim();
      displayProducts();
    };

    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearch();
    });
    searchBtn.addEventListener("click", handleSearch);
  }
}

async function displayProducts() {
  const products = await fetchAllProducts(currentFilters);
  allProducts = products.products;
  currentFilters.lastVisible = products.lastVisible;

  displayProductsHTML(allProducts);
  setupPagination();
}

function displayProductsHTML(products) {
  const container = document.getElementById("products-container");
  const noProducts = document.getElementById("no-products");

  if (products.length === 0) {
    container.innerHTML = "";
    if (noProducts) noProducts.classList.remove("no-products-hidden");
    return;
  }

  if (noProducts) noProducts.classList.add("no-products-hidden");

  container.innerHTML = products
    .map(
      (product) => `
      <div class="col-md-6 col-lg-4 col-xl-3">
        <div class="product-card" onclick="viewProductDetails('${product.id}')">
          <div class="position-relative">
            <img src="${product.image}" alt="${
        product.name
      }" class="product-image">
            <div class="category-indicator">${getCategoryName(
              product.category
            )}</div>
            ${
              product.stock < 10
                ? '<div class="product-badge">Low Stock</div>'
                : ""
            }
            <button class="wishlist-btn position-absolute top-0 end-0 m-2" title="Add to wishlist" 
              onclick="event.stopPropagation(); toggleWishlistSafely({ 
                id: '${product.id}', 
                name: '${product.name.replace(/'/g, "&#39;")}', 
                price: ${product.price}, 
                image: '${product.image.replace(/'/g, "&#39;")}', 
                rating: ${product.rating} 
              }, this);">
              <i class="fas fa-heart"></i>
            </button>
          </div>
          <div class="product-info">
            <h5 class="product-name">${product.name}</h5>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-meta">
              <div class="product-rating">
                ${generateStars(product.rating)} (${product.rating})
              </div>
              <div class="product-stock">${product.stock} left</div>
            </div>
            <div class="quantity-controls" onclick="event.stopPropagation()">
              <button class="quantity-btn" onclick="decreaseQuantity('${
                product.id
              }')">-</button>
              <input type="number" class="quantity-input" id="qty-${
                product.id
              }" value="1" min="1" max="${product.stock}">
              <button class="quantity-btn" onclick="increaseQuantity('${
                product.id
              }')">+</button>
            </div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${
              product.id
            }')">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  setTimeout(() => updateWishlistButtonStates(), 50);
}

function setupPagination() {
  const paginationContainer =
    document.querySelector(".pagination") || createPaginationContainer();
  paginationContainer.innerHTML = `
    <button class="btn btn-primary load-more-btn" onclick="loadMoreProducts()">Load More</button>
  `;
}

function createPaginationContainer() {
  const container = document.createElement("div");
  container.className = "pagination d-flex justify-content-center gap-2 mt-4";
  document.querySelector(".products-section .container").appendChild(container);
  return container;
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

function getCategoryName(category) {
  const categories = {
    electronics: "Electronics",
    audio: "Audio",
    accessories: "Accessories",
  };
  return categories[category] || category;
}

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

function updateCartUI() {
  const cartCount = currentCart.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
  if (cartLink) {
    cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
  }
}

function updateWishlistCount() {
  try {
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
  } catch (error) {
    console.log("Wishlist functions not yet loaded:", error);
  }
}

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

// Global functions
window.loadMoreProducts = async () => {
  const loadMoreBtn = document.querySelector(".load-more-btn");
  const spinner = document.querySelector(".spinner");

  loadMoreBtn.style.display = "none";
  spinner.style.display = "block";

  const moreProducts = await fetchAllProducts(currentFilters);

  spinner.style.display = "none";
  loadMoreBtn.style.display = "block";

  allProducts = [...allProducts, ...moreProducts.products];
  currentFilters.lastVisible = moreProducts.lastVisible;

  displayProductsHTML(allProducts);
};

window.increaseQuantity = function (productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  const product = allProducts.find((p) => p.id === productId);
  if (parseInt(qtyInput.value) < product.stock) {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  }
};

window.decreaseQuantity = function (productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  if (parseInt(qtyInput.value) > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
};

window.addToCart = function (productId, quantity = null) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const qtyInput = document.getElementById(`qty-${productId}`);
  const finalQuantity = quantity || parseInt(qtyInput?.value || 1);

  const existingItem = currentCart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += finalQuantity;
  } else {
    currentCart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: finalQuantity,
    });
  }

  if (qtyInput) qtyInput.value = 1;

  localStorage.setItem("cart", JSON.stringify(currentCart));
  updateCartUI();
  showNotification(`${product.name} added to cart!`);
};

window.viewProductDetails = function (productId) {
  window.location.href =
    "../product-details/product-details.html?id=" + productId;
};

window.toggleWishlistSafely = function (product, buttonElement) {
  if (
    typeof window.toggleWishlist === "function" &&
    typeof window.isInWishlist === "function"
  ) {
    window.toggleWishlist(product);
    buttonElement.classList.toggle("active", window.isInWishlist(product.id));
    updateWishlistCount();
  } else {
    setTimeout(() => {
      if (
        typeof window.toggleWishlist === "function" &&
        typeof window.isInWishlist === "function"
      ) {
        window.toggleWishlist(product);
        buttonElement.classList.toggle(
          "active",
          window.isInWishlist(product.id)
        );
        updateWishlistCount();
      }
    }, 100);
  }
};
