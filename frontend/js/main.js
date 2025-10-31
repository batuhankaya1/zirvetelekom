// Shopping Cart - now handled by cart.js

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
        let productId = productCard ? productCard.dataset.id : e.target.dataset.productId;
        
        if (!productId) {
            console.error('Product ID not found');
            return;
        }
        
        productId = parseInt(productId);
        console.log('Clicking add to cart for product:', productId);
        
        // Use the global addToCart function from cart.js
        if (window.addToCart) {
            window.addToCart(productId, 1);
            
            // Visual feedback
            e.target.textContent = 'Eklendi!';
            e.target.style.background = '#10b981';
            
            setTimeout(() => {
                e.target.textContent = 'Sepete Ekle';
                e.target.style.background = '';
            }, 1500);
        } else {
            console.error('addToCart function not available');
        }
    }
});

// Update cart count
function updateCartCount() {
    if (cartCountElement) {
        cartCountElement.textContent = '0';
    }
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
    console.log('DOM loaded, path:', window.location.pathname);
    
    // Initialize cart system
    setTimeout(() => {
        if (window.addToCart) {
            console.log('Cart system ready');
        }
        if (window.updateCartCount) {
            window.updateCartCount();
        }
    }, 500);
    
    checkUserAuth();
    
    // Force load products after DOM is ready
    setTimeout(() => {
        if (window.location.pathname.includes('/pages/')) {
            if (window.location.pathname.includes('products.html')) {
                loadAllProducts();
            } else {
                loadCategoryProducts();
            }
        } else {
            // Homepage - always load featured products
            console.log('Loading homepage products');
            loadFeaturedProducts();
        }
    }, 100);
});

// Load featured products for homepage
function loadFeaturedProducts() {
    console.log('Loading featured products...');
    
    fetch('/api/products/featured')
    .then(response => {
        console.log('Response status:', response.status);
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
        const featuredGrid = document.querySelector('.featured-products .products-grid');
        if (featuredGrid) {
            featuredGrid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: #ef4444;">Hata: ${error.message}</p>`;
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
        productCard.dataset.category = product.category;
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
            <button class="btn-primary add-to-cart" data-product-id="${product.id}">Sepete Ekle</button>
        `;
        
        featuredGrid.appendChild(productCard);
    });
}

// Load category products from backend
function loadCategoryProducts() {
    const currentPage = window.location.pathname;
    let category = '';
    
    console.log('Current page path:', currentPage);
    
    if (currentPage.includes('phones.html')) category = 'phone';
    else if (currentPage.includes('tablets.html')) category = 'tablet';
    else if (currentPage.includes('accessories.html')) category = 'accessory';
    else if (currentPage.includes('computers.html')) category = 'laptop';
    
    console.log('Detected category:', category);
    
    if (category) {
        console.log('Fetching products for category:', category);
        fetch(`/api/products?category=${category}`)
        .then(response => {
            console.log('Category API response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            console.log('Category products received:', products.length, 'products');
            console.log('Products data:', products);
            updateProductGrid(products);
        })
        .catch(error => {
            console.error('Error loading category products:', error);
            const productsGrid = document.querySelector('.products-grid');
            if (productsGrid) {
                productsGrid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: #ef4444;">Hata: ${error.message}</p>`;
            }
        });
    } else {
        console.log('No category detected for path:', currentPage);
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
        productCard.dataset.category = product.category;
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
            <button class="btn-primary add-to-cart" data-product-id="${product.id}">Sepete Ekle</button>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Load all products for products page
function loadAllProducts() {
    console.log('Loading all products...');
    
    fetch('/api/products')
    .then(response => {
        console.log('All products response status:', response.status);
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

// Check user authentication
function checkUserAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authBtn = document.getElementById('auth-btn');
    
    if (user && authBtn) {
        authBtn.textContent = user.name;
        authBtn.onclick = () => location.href = 'pages/profile.html';
    }
}

// Format price helper
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(price);
}