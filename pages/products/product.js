import { fetchAllProducts } from "../../data/products.js";

let allProducts = [];

// Global state and pagination cursor
let filteredProducts = [...allProducts];
let currentPage = 1;
const productsPerPage = 8;
let currentFilters = {
  category: "",
  sort: "",
  search: "",
  lastVisible: null,
  limitPerPage: 8,
};

// Cart functionality
let currentCart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", function () {
  initProductsPage();

  //  cart functionality
  updateCartUI();

  //  wishlist functionality
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
  applyFilters();
  setupPagination();
}

function setupFilters() {
  const categoryFilter = document.getElementById("category-select");
  const sortFilter = document.getElementById("sort-select");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      currentFilters.category = e.target.value === "all" ? "" : e.target.value;

      displayProducts(currentFilters);
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", (e) => {
      currentFilters.sort = e.target.value;
      displayProducts(currentFilters);
    });
  }
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  if (searchInput && searchBtn) {
    searchInput.addEventListener("input", function () {
      currentFilters.search = this.value.trim();
      currentPage = 1;
      displayProducts(currentFilters);
    });

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        currentFilters.search = this.value.trim();
        currentPage = 1;
        displayProducts(currentFilters);
      }
    });

    searchBtn.addEventListener("click", () => {
      currentFilters.search = searchInput.value.trim();
      currentPage = 1;
      displayProducts(currentFilters);
    });
  }
}

function applyFilters() {
  // Start with all products
  filteredProducts = [...allProducts];

  // Apply category filter
  if (currentFilters.category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === currentFilters.category
    );
  }

  // Apply search filter
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  }

  // Apply sorting
  filteredProducts.sort((a, b) => {
    switch (currentFilters.sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  displayProducts();
  setupPagination();
}

function displayProductsHTML(allProducts) {
  const container = document.getElementById("products-container");
  const noProducts = document.getElementById("no-products");

  if (allProducts.length === 0) {
    container.innerHTML = "";
    if (noProducts) {
      noProducts.classList.remove("no-products-hidden");
    }
    return;
  }

  if (noProducts) {
    noProducts.classList.add("no-products-hidden");
  }

  container.innerHTML = allProducts
    .map((product) => {
      return `
        <div class="col-md-6 col-lg-4 col-xl-3">
          <div class="product-card" onclick="viewProductDetails('${
            product.id
          }')">
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
              <h5 class="product-name">${product.name}</h5>
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
      `;
    })
    .join("");

  // Update wishlist button states after rendering
  setTimeout(() => {
    updateWishlistButtonStates();
  }, 50);

  // After render, sync wishlist active state
  try {
    const buttons = container.querySelectorAll(".wishlist-btn");
    buttons.forEach((btn) => {
      const onclick = btn.getAttribute("onclick");
      if (onclick) {
        const match = onclick.match(/id:\s*'([^']+)'/);
        if (match) {
          const productId = match[1];
          if (typeof window.isInWishlist === "function") {
            btn.classList.toggle("active", window.isInWishlist(productId));
          }
        }
      }
    });
  } catch {}
}

// Function to update all wishlist button states
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

function setupPagination() {
  const paginationContainer =
    document.querySelector(".pagination") || createPaginationContainer();

  let paginationHTML = "";

  // load more for firestore pagination
  if (true) {
    paginationHTML += `
      <button class="btn btn-primary load-more-btn" onclick="loadMoreProducts()">Load More</button>
    `;
  }

  paginationContainer.innerHTML = paginationHTML;
}

window.loadMoreProducts = async () => {
  let loadMoreBtn = document.querySelector(".load-more-btn");
  let spinner = document.querySelector(".spinner");

  loadMoreBtn.style.display = "none";
  spinner.style.display = "block";

  let moreProducts = await fetchAllProducts(currentFilters);

  spinner.style.display = "none";
  loadMoreBtn.style.display = "block";

  allProducts = [...allProducts, ...moreProducts.products];
  currentFilters.lastVisible = moreProducts.lastVisible;

  displayProductsHTML(allProducts);
};

function createPaginationContainer() {
  const container = document.createElement("div");
  container.className = "pagination d-flex justify-content-center gap-2 mt-4";
  document.querySelector(".products-section .container").appendChild(container);
  return container;
}

// Generate star rating
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

// Get category display name
function getCategoryName(category) {
  const categories = {
    electronics: "Electronics",
    audio: "Audio",
    accessories: "Accessories",
  };
  return categories[category] || category;
}

// Quantity controls
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

// Add to cart functionality
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

  // Reset quantity input
  if (qtyInput) {
    qtyInput.value = 1;
  }

  localStorage.setItem("cart", JSON.stringify(currentCart));
  updateCartUI();
  showNotification(`${product.name} added to cart!`);
};

// Update cart UI
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

async function displayProducts() {
  const products = await fetchAllProducts(currentFilters);

  allProducts = products.products;
  currentFilters.lastVisible = products.lastVisible;

  console.log(products);

  displayProductsHTML(allProducts);
  setupPagination();

  console.log(allProducts);
}

window.loadMoreProducts = async () => {
  let loadMoreBtn = document.querySelector(".load-more-btn");
  let spinner = document.querySelector(".spinner");

  loadMoreBtn.style.display = "none";
  spinner.style.display = "block";

  let moreProducts = await fetchAllProducts(currentFilters);

  spinner.style.display = "none";
  loadMoreBtn.style.display = "block";

  allProducts = [...allProducts, ...moreProducts.products];
  currentFilters.lastVisible = moreProducts.lastVisible;

  displayProductsHTML(allProducts);
};

// View product details
window.viewProductDetails = function viewProductDetails(productId) {
  window.location.href =
    "../product-details/product-details.html?id=" + productId;
};

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

function updateWishlistCount() {
  console.log("updateWishlistCount");
  try {
    const count = window.getWishlist ? window.getWishlist().length : 0;
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
  } catch (error) {
    console.log("Wishlist functions not yet loaded:", error);
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

window.allProducts = allProducts;

//?====================================================================================
