// Cart functionality with session support
let sessionId = localStorage.getItem('sessionId') || null;
let cart = [];

// DOM Elements
const cartItemsContainer = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const cartSummary = document.getElementById('cartSummary');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const cartCountElement = document.querySelector('.cart-count');

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart.js loaded');
    initializeSession();
});

// Also initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSession);
} else {
    initializeSession();
}

// Initialize session
async function initializeSession() {
    if (!sessionId) {
        try {
            const response = await fetch('/api/cart/session', { method: 'POST' });
            const data = await response.json();
            sessionId = data.sessionId;
            localStorage.setItem('sessionId', sessionId);
            console.log('Session initialized:', sessionId);
        } catch (error) {
            console.error('Session oluşturulamadı:', error);
            return;
        }
    }
    
    await loadCartFromServer();
    displayCartItems();
    updateCartCount();
}

// Load cart from server
async function loadCartFromServer() {
    if (!sessionId) return;
    
    try {
        const userId = localStorage.getItem('userId');
        const url = `/api/cart/${sessionId}${userId ? `?userId=${userId}` : ''}`;
        const response = await fetch(url);
        
        if (response.ok) {
            cart = await response.json();
            console.log('Cart loaded:', cart);
        }
    } catch (error) {
        console.error('Sepet yüklenemedi:', error);
    }
}

// Display cart items
function displayCartItems() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';

    let cartHTML = '';
    cart.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item">
                <div class="item-image">
                    <img src="${item.image || '/images/default.jpg'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity" value="${item.quantity}" min="1" onchange="setQuantity(${item.productId}, this.value)">
                    <button class="quantity-btn" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.productId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHTML;
    updateCartSummary();
}

// Update quantity
async function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        await removeFromCart(productId);
        return;
    }
    
    try {
        const response = await fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                productId,
                quantity: newQuantity
            })
        });
        
        if (response.ok) {
            await loadCartFromServer();
            displayCartItems();
            updateCartCount();
        }
    } catch (error) {
        console.error('Miktar güncellenemedi:', error);
    }
}

// Set quantity directly
function setQuantity(productId, quantity) {
    const qty = parseInt(quantity);
    updateQuantity(productId, qty);
}

// Remove item from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch('/api/cart/remove', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                productId
            })
        });
        
        if (response.ok) {
            await loadCartFromServer();
            displayCartItems();
            updateCartCount();
        }
    } catch (error) {
        console.error('Ürün kaldırılamadı:', error);
    }
}

// Clear entire cart
document.querySelector('.clear-cart')?.addEventListener('click', async function() {
    if (confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`/api/cart/clear/${sessionId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                cart = [];
                displayCartItems();
                updateCartCount();
            }
        } catch (error) {
            console.error('Sepet temizlenemedi:', error);
        }
    }
});

// Update cart summary
function updateCartSummary() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (totalElement) totalElement.textContent = formatPrice(subtotal);
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Add to cart function (for product pages)
window.addToCart = async function(productId, quantity = 1) {
    console.log('Adding to cart:', productId, quantity);
    
    // Ensure session exists
    if (!sessionId) {
        try {
            const response = await fetch('/api/cart/session', { method: 'POST' });
            const data = await response.json();
            sessionId = data.sessionId;
            localStorage.setItem('sessionId', sessionId);
            console.log('New session created:', sessionId);
        } catch (error) {
            console.error('Session oluşturulamadı:', error);
            showNotification('Sepet sistemi başlatılamadı', 'error');
            return;
        }
    }
    
    try {
        const userId = localStorage.getItem('userId');
        console.log('Sending cart request:', { sessionId, userId, productId, quantity });
        
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                userId: userId ? parseInt(userId) : null,
                productId: parseInt(productId),
                quantity: parseInt(quantity)
            })
        });
        
        const data = await response.json();
        console.log('Cart response:', data);
        
        if (response.ok) {
            await loadCartFromServer();
            updateCartCount();
            showNotification('Ürün sepete eklendi!', 'success');
        } else {
            console.error('Cart error:', data);
            showNotification(data.message || 'Hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Sepete eklenemedi:', error);
        showNotification('Bağlantı hatası', 'error');
    }
};

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
document.querySelector('.checkout-btn')?.addEventListener('click', async function() {
    if (cart.length === 0) return;
    
    alert('Sipariş işlemi demo amaçlıdır. Gerçek bir ödeme yapılmamıştır.');
    
    try {
        const response = await fetch(`/api/cart/clear/${sessionId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            cart = [];
            displayCartItems();
            updateCartCount();
        }
    } catch (error) {
        console.error('Sepet temizlenemedi:', error);
    }
});

// Export for global use
window.loadCartFromServer = loadCartFromServer;
window.updateCartCount = updateCartCount;