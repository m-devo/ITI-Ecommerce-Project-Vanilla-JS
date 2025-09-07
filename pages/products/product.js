// Products data
const allProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    description:
      "High-quality wireless headphones with noise cancellation and premium sound",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.5,
    stock: 15,
    category: "electronics",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Smart Watch",
    description:
      "Feature-rich smartwatch with health monitoring and fitness tracking",
    price: 199.99,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.8,
    stock: 8,
    category: "electronics",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 3,
    name: "Laptop Backpack",
    description:
      "Durable laptop backpack with multiple compartments and water resistance",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.2,
    stock: 23,
    category: "accessories",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    description:
      "Portable bluetooth speaker with amazing sound quality and long battery life",
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.6,
    stock: 12,
    category: "audio",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: 5,
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse for productivity and gaming",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.3,
    stock: 31,
    category: "electronics",
    createdAt: new Date("2024-01-25"),
  },
  {
    id: 6,
    name: "Phone Case",
    description:
      "Protective phone case with wireless charging support and premium materials",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.1,
    stock: 45,
    category: "accessories",
    createdAt: new Date("2024-01-30"),
  },
  {
    id: 7,
    name: "Gaming Keyboard",
    description:
      "Mechanical gaming keyboard with RGB backlighting and tactile switches",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.7,
    stock: 18,
    category: "electronics",
    createdAt: new Date("2024-02-05"),
  },
  {
    id: 8,
    name: "Wireless Earbuds",
    description:
      "True wireless earbuds with active noise cancellation and premium audio",
    price: 159.99,
    image:
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.4,
    stock: 22,
    category: "audio",
    createdAt: new Date("2024-02-08"),
  },
  {
    id: 9,
    name: "USB-C Hub",
    description: "Multi-port USB-C hub with HDMI, USB 3.0, and power delivery",
    price: 39.99,
    image:
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.0,
    stock: 35,
    category: "electronics",
    createdAt: new Date("2024-01-18"),
  },
  {
    id: 10,
    name: "Wireless Charger",
    description:
      "Fast wireless charging pad compatible with all Qi-enabled devices",
    price: 34.99,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.3,
    stock: 28,
    category: "electronics",
    createdAt: new Date("2024-01-22"),
  },
  {
    id: 11,
    name: "Travel Organizer",
    description:
      "Premium leather travel organizer for cables, chargers, and small accessories",
    price: 44.99,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.5,
    stock: 16,
    category: "accessories",
    createdAt: new Date("2024-02-10"),
  },
  {
    id: 12,
    name: "Portable Monitor",
    description:
      "15.6 inch portable monitor with USB-C connectivity for laptops",
    price: 249.99,
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.6,
    stock: 9,
    category: "electronics",
    createdAt: new Date("2024-02-12"),
  },
];

let filteredProducts = [...allProducts];
let currentPage = 1;
const productsPerPage = 8;
let currentFilters = {
  category: "",
  sort: "name",
  search: "",
};

// Cart functionality
let currentCart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", function () {
  initProductsPage();
});

function initProductsPage() {
  // Initialize filters
  setupFilters();

  // Setup search
  setupSearch();

  // Load products
  applyFilters();

  // Setup cart functionality
  updateCartUI();
}

function setupFilters() {
  const categoryFilter = document.getElementById("category-select");
  const sortFilter = document.getElementById("sort-select");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      currentFilters.category = e.target.value === "all" ? "" : e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", (e) => {
      currentFilters.sort = e.target.value;
      applyFilters();
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
      applyFilters();
    });

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        currentFilters.search = this.value.trim();
        currentPage = 1;
        applyFilters();
      }
    });

    searchBtn.addEventListener("click", () => {
      currentFilters.search = searchInput.value.trim();
      currentPage = 1;
      applyFilters();
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

function displayProducts() {
  const container = document.getElementById("products-container");
  const noProducts = document.getElementById("no-products");
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);

  if (productsToShow.length === 0) {
    container.innerHTML = "";
    if (noProducts) {
      noProducts.classList.remove("no-products-hidden");
    }
    return;
  }

  if (noProducts) {
    noProducts.classList.add("no-products-hidden");
  }

  container.innerHTML = productsToShow
    .map((product) => {
      return `
        <div class="col-md-6 col-lg-4 col-xl-3">
          <div class="product-card" onclick="viewProductDetails(${product.id})">
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
      `;
    })
    .join("");
}

function setupPagination() {
  const paginationContainer =
    document.querySelector(".pagination") || createPaginationContainer();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button class="page-btn btn btn-outline-primary" onclick="goToPage(${
      currentPage - 1
    })">‹ Previous</button>`;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="page-btn btn btn-primary">${i}</button>`;
    } else if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
      paginationHTML += `<button class="page-btn btn btn-outline-primary" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += `<span class="page-dots mx-2">...</span>`;
    }
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="page-btn btn btn-outline-primary" onclick="goToPage(${
      currentPage + 1
    })">Next ›</button>`;
  }

  paginationContainer.innerHTML = paginationHTML;
}

function createPaginationContainer() {
  const container = document.createElement("div");
  container.className = "pagination d-flex justify-content-center gap-2 mt-4";
  document.querySelector(".products-section .container").appendChild(container);
  return container;
}

function goToPage(page) {
  currentPage = page;
  displayProducts();
  setupPagination();

  // Scroll to top of products
  document.querySelector(".products-section").scrollIntoView({
    behavior: "smooth",
  });
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
function increaseQuantity(productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  const product = allProducts.find((p) => p.id === productId);

  if (parseInt(qtyInput.value) < product.stock) {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  }
}

function decreaseQuantity(productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);

  if (parseInt(qtyInput.value) > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
}

// Add to cart functionality
function addToCart(productId, quantity = null) {
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
}

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

// View product details
function viewProductDetails(productId) {
  // Store the selected product ID for the details page
  localStorage.setItem("selectedProductId", productId);
  // Navigate to product details page
  window.location.href = "../product-details/product-details.html";
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

// Make products available globally
window.allProducts = allProducts;

//?====================================================================================
