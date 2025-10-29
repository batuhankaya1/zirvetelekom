// Shopping Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const cartCountElement = document.querySelector('.cart-count');

// Load products from admin panel if available
function loadAdminProducts() {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts'));
    if (adminProducts && adminProducts.length > 0) {
        return adminProducts;
    }
    return null;
}

// Add to cart functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart')) {
        const productCard = e.target.closest('.product-card');
        const productId = productCard.dataset.id;
        const productName = productCard.querySelector('h3').textContent;
        const productPriceText = productCard.querySelector('.new-price').textContent;
        const productPrice = parseInt(productPriceText.replace(/[^0-9]/g, ''));
        
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
        
        saveCart();
        updateCartCount();
        
        // Visual feedback
        e.target.textContent = 'Eklendi!';
        e.target.style.background = '#10b981';
        
        setTimeout(() => {
            e.target.textContent = 'Sepete Ekle';
            e.target.style.background = '';
        }, 1500);
    }
});

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

// Product filtering (for products page)
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const productsGrid = document.getElementById('productsGrid');

if (categoryFilter && priceFilter) {
    categoryFilter.addEventListener('change', filterProducts);
    priceFilter.addEventListener('change', filterProducts);
}

function filterProducts() {
    const categoryValue = categoryFilter.value;
    const priceValue = priceFilter.value;
    const products = productsGrid.querySelectorAll('.product-card');
    
    products.forEach(product => {
        let showProduct = true;
        
        // Category filter
        if (categoryValue && product.dataset.category !== categoryValue) {
            showProduct = false;
        }
        
        // Price filter
        if (priceValue && showProduct) {
            const productPrice = parseInt(product.dataset.price);
            
            switch(priceValue) {
                case '0-5000':
                    if (productPrice > 5000) showProduct = false;
                    break;
                case '5000-15000':
                    if (productPrice < 5000 || productPrice > 15000) showProduct = false;
                    break;
                case '15000-30000':
                    if (productPrice < 15000 || productPrice > 30000) showProduct = false;
                    break;
                case '30000+':
                    if (productPrice < 30000) showProduct = false;
                    break;
            }
        }
        
        product.style.display = showProduct ? 'block' : 'none';
    });
}

// Mobile menu toggle
const menuButton = document.querySelector('.btn-menu');
const nav = document.querySelector('.nav');

if (menuButton) {
    menuButton.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Load products if on category pages
    if (window.location.pathname.includes('/pages/')) {
        if (window.location.pathname.includes('products.html')) {
            loadAllProducts();
        } else {
            loadCategoryProducts();
        }
    }
    
    // Load featured products on homepage
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        loadFeaturedProducts();
    }
});

// Load featured products for homepage
function loadFeaturedProducts() {
    fetch('http://localhost:3000/api/products/featured')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(products => {
        console.log('Featured products loaded:', products);
        updateFeaturedProductsGrid(products);
    })
    .catch(error => {
        console.error('Error loading featured products:', error);
        // Show empty state instead of fallback
        const featuredGrid = document.querySelector('.featured-products .products-grid');
        if (featuredGrid) {
            featuredGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Henüz öne çıkarılan ürün bulunmamaktadır.</p>';
        }
    });
}

// Update featured products grid
function updateFeaturedProductsGrid(products) {
    const featuredGrid = document.querySelector('.featured-products .products-grid');
    if (!featuredGrid) return;
    
    if (products.length === 0) {
        featuredGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Henüz ürün bulunmamaktadır.</p>';
        return;
    }
    
    featuredGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        productCard.dataset.name = product.name;
        productCard.dataset.price = product.price;
        
        productCard.innerHTML = `
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image"></div>
            <h3>${product.name}</h3>
            <p>${product.description || ''}</p>
            <div class="price">
                ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                <span class="new-price">${formatPrice(product.price)}</span>
            </div>
            <button class="btn-primary add-to-cart">Sepete Ekle</button>
        `;
        
        featuredGrid.appendChild(productCard);
    });
}

// Load category products from backend
function loadCategoryProducts() {
    const currentPage = window.location.pathname;
    let category = '';
    
    if (currentPage.includes('phones.html')) category = 'phone';
    else if (currentPage.includes('tablets.html')) category = 'tablet';
    else if (currentPage.includes('accessories.html')) category = 'accessory';
    else if (currentPage.includes('computers.html')) category = 'computer';
    
    if (category) {
        // Try to load from backend first
        fetch(`http://localhost:3000/api/products?category=${category}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            updateProductGrid(products);
        })
        .catch(error => {
            console.error('Error loading products:', error);
            // Show loading error message
            const productsGrid = document.querySelector('.products-grid');
            if (productsGrid) {
                productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #ef4444;">Ürünler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.</p>';
            }
        });
    }
}

// Update product grid with products
function updateProductGrid(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Bu kategoride henüz ürün bulunmamaktadır.</p>';
        return;
    }
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        productCard.dataset.name = product.name;
        productCard.dataset.price = product.price;
        
        productCard.innerHTML = `
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image"></div>
            <h3>${product.name}</h3>
            <p>${product.description || ''}</p>
            <div class="price">
                ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                <span class="new-price">${formatPrice(product.price)}</span>
            </div>
            <button class="btn-primary add-to-cart">Sepete Ekle</button>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Load all products for products page
function loadAllProducts() {
    fetch('http://localhost:3000/api/products')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(products => {
        updateProductGrid(products);
    })
    .catch(error => {
        console.error('Error loading products:', error);
        const productsGrid = document.querySelector('#productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #ef4444;">Ürünler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.</p>';
        }
    });
}

// Format price helper
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(price);
}