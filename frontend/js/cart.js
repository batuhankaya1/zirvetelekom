// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const cartItemsContainer = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const cartSummary = document.getElementById('cartSummary');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const cartCountElement = document.querySelector('.cart-count');

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    updateCartCount();
});

// Display cart items
function displayCartItems() {
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartSummary.style.display = 'block';

    let cartHTML = '';
    cart.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item">
                <div class="item-image"></div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <input type="number" class="quantity" value="${item.quantity}" min="1" onchange="setQuantity(${index}, this.value)">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHTML;
    updateCartSummary();
}

// Update quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
        return;
    }
    saveCart();
    displayCartItems();
    updateCartCount();
}

// Set quantity directly
function setQuantity(index, quantity) {
    const qty = parseInt(quantity);
    if (qty <= 0) {
        removeFromCart(index);
        return;
    }
    cart[index].quantity = qty;
    saveCart();
    displayCartItems();
    updateCartCount();
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    displayCartItems();
    updateCartCount();
}

// Clear entire cart
document.querySelector('.clear-cart')?.addEventListener('click', function() {
    if (confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
        cart = [];
        saveCart();
        displayCartItems();
        updateCartCount();
    }
});

// Update cart summary
function updateCartSummary() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    subtotalElement.textContent = formatPrice(subtotal);
    totalElement.textContent = formatPrice(subtotal); // Free shipping
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(price);
}

// Checkout functionality
document.querySelector('.checkout-btn')?.addEventListener('click', function() {
    if (cart.length === 0) return;
    
    alert('Sipariş işlemi demo amaçlıdır. Gerçek bir ödeme yapılmamıştır.');
    cart = [];
    saveCart();
    displayCartItems();
    updateCartCount();
});