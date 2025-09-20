const products = [
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
    category: "audio",
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
  },
  {
    id: 5,
    name: "Wireless Mouse",
    description:
      "Ergonomic wireless mouse for productivity and gaming with nice price check it out ",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    rating: 4.3,
    stock: 31,
    category: "electronics",
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
  },
];

// Shopping cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// DOM elements
const productsContainer = document.getElementById("products-container");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  displayFeaturedProducts();
  updateCartUI();
});

// Display featured products (first 9)
function displayFeaturedProducts() {
  const featuredProducts = products.slice(0, 9);

  productsContainer.innerHTML = featuredProducts
    .map(
      (product) => `
    <div class="col-md-6 col-lg-4">
      <div class="product-card" onclick="viewProductDetails(${product.id})">
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

// Quantity controls
function increaseQuantity(productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  const product = products.find((p) => p.id === productId);

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
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
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

// Update cart UI
function updateCartUI() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

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

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// View product details
function viewProductDetails(productId) {
  localStorage.setItem("selectedProductId", productId);
  window.location.href = "/pages/product-details/product-details.html";
}

window.products = products;
window.cart = cart;
