document.addEventListener('DOMContentLoaded', updateCartIcon);

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getCart() {
    const cartJson = localStorage.getItem('shoppingCart');
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

function addProductToCart(product, quantity = 1) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        product.quantity = quantity;
        cart.push(product);
    }

    saveCart(cart);
    showNotification(`${product.name} Added to Cart.  `, 'success');
    updateCartIcon();
}

function removeProductFromCart(productId) {
    let cart = getCart();
    const itemToRemove = cart.find(item => item.id === productId);
    const updatedCart = cart.filter(item => item.id !== productId);
    
    saveCart(updatedCart);

    if (itemToRemove) {
        showNotification(`${itemToRemove.name} Deleted from Cart.   `, 'danger');
    }
    updateCartIcon();
}

function updateProductQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemToUpdate = cart.find(item => item.id === productId);

    if (itemToUpdate) {
        if (newQuantity > 0) {
            itemToUpdate.quantity = newQuantity;
        } else {

            const updatedCart = cart.filter(item => item.id !== productId);
            saveCart(updatedCart);
            showNotification(`${itemToUpdate.name} Deleted from Cart.`, 'danger');
            updateCartIcon();
            return;
        }
    }
    saveCart(cart);
    updateCartIcon();
}

function getCartItemCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
    return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartIcon() {
    const cartIcon = document.getElementById('cart-item-count');
    if (cartIcon) {
        cartIcon.textContent = getCartItemCount();
    }
}