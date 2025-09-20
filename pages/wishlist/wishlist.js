function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  } catch {
    return [];
  }
}

function setWishlist(list) {
  localStorage.setItem("wishlist", JSON.stringify(list));
  window.dispatchEvent(
    new CustomEvent("wishlist:updated", { detail: { count: list.length } })
  );
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

function renderWishlist() {
  const container = document.getElementById("wishlist-items-container");
  const emptyState = document.getElementById("empty-wishlist");
  const clearBtn = document.getElementById("clear-wishlist-btn");

  if (!container) return;

  let list = getWishlist();

  // Sort wishlist
  const sortSelect = document.getElementById("wishlist-sort");
  const sort = sortSelect ? sortSelect.value : "newest";
  list = list.slice().sort((a, b) => {
    switch (sort) {
      case "oldest":
        return (a.addedAt || 0) - (b.addedAt || 0);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "newest":
      default:
        return (b.addedAt || 0) - (a.addedAt || 0);
    }
  });

  if (list.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    if (clearBtn) clearBtn.classList.add("hidden");
  } else {
    if (emptyState) emptyState.classList.add("hidden");
    if (clearBtn) clearBtn.classList.remove("hidden");

    container.innerHTML = list
      .map((p) => {
        const date = p.addedAt ? new Date(p.addedAt).toLocaleDateString() : "";
        const rating =
          typeof generateStars === "function"
            ? generateStars(p.rating || 0)
            : "";
        return `
          <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="wishlist-item-card">
              <div class="wishlist-item-image">
                <img src="${p.image}" alt="${p.name}">
                <div class="wishlist-date-badge">${date}</div>
                <button class="remove-from-wishlist" title="Remove" onclick="removeFromWishlist(${
                  p.id
                })">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="wishlist-item-info">
                <h5 class="wishlist-item-title">${p.name}</h5>
                <div class="wishlist-item-price">$${Number(
                  p.price || 0
                ).toFixed(2)}</div>
                <div class="wishlist-item-rating">${rating} <span class="text-muted">(${
          p.rating || 0
        })</span></div>
                <div class="wishlist-item-actions">
                  <a class="btn btn-outline-primary" href="../product-details/product-details.html" onclick="event.preventDefault(); viewProductDetails(${
                    p.id
                  });">
                    <i class="fas fa-eye me-1"></i> View
                  </a>
                  <button class="btn btn-primary" onclick="openMoveToCart(${
                    p.id
                  })">
                    <i class="fas fa-shopping-cart me-1"></i> Move to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  updateWishlistCount();
}

function isInWishlist(id) {
  return getWishlist().some((p) => p.id === id);
}

function addToWishlist(product) {
  if (!product || typeof product.id === "undefined") return;
  const list = getWishlist();
  if (!list.some((p) => p.id === product.id)) {
    list.push({ ...product, addedAt: Date.now() });
    setWishlist(list);
  }
}

function removeFromWishlist(id) {
  const list = getWishlist().filter((p) => p.id !== id);
  setWishlist(list);
  renderWishlist();
}

function toggleWishlist(product) {
  if (!product || typeof product.id === "undefined") return;
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
  } else {
    addToWishlist(product);
  }
}

function clearWishlist() {
  setWishlist([]);
  renderWishlist();
}

// Move to cart modal
let modalSelectedProductId = null;

function openMoveToCart(productId) {
  modalSelectedProductId = productId;
  const input = document.getElementById("modal-quantity");
  if (input) input.value = 1;
  const modalEl = document.getElementById("moveToCartModal");
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function increaseModalQuantity() {
  const input = document.getElementById("modal-quantity");
  if (!input) return;
  input.value = parseInt(input.value || 1) + 1;
}

function decreaseModalQuantity() {
  const input = document.getElementById("modal-quantity");
  if (!input) return;
  const val = parseInt(input.value || 1);
  input.value = val > 1 ? val - 1 : 1;
}

function attachModalConfirm() {
  const btn = document.getElementById("confirm-move-to-cart");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!modalSelectedProductId) return;
    const qty = parseInt(document.getElementById("modal-quantity")?.value || 1);

    const product = (window.allProducts || window.products || []).find(
      (p) => p.id === modalSelectedProductId
    );
    if (product && typeof addToCart === "function") {
      addToCart(product.id, qty);
      removeFromWishlist(product.id);
    }

    const modalEl = document.getElementById("moveToCartModal");
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("wishlist-sort");
  if (sortSelect) {
    sortSelect.setAttribute("aria-label", "Sort wishlist");
    sortSelect.addEventListener("change", renderWishlist);
  }

  renderWishlist();

  window.addEventListener("wishlist:updated", () => {
    updateWishlistCount();
    renderWishlist();
  });

  attachModalConfirm();
});

window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.toggleWishlist = toggleWishlist;
window.clearWishlist = clearWishlist;
window.openMoveToCart = openMoveToCart;
window.increaseModalQuantity = increaseModalQuantity;
window.decreaseModalQuantity = decreaseModalQuantity;
window.updateWishlistCount = updateWishlistCount;
