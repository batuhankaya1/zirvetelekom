// Admin Panel JavaScript
let products = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromBackend();
    setupEventListeners();
    
    // Show products section by default
    showSection('products');
});

// Load products from backend
function loadProductsFromBackend() {
    fetch('http://localhost:3000/api/products')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        products = data;
        loadProducts();
    })
    .catch(error => {
        console.error('Error loading products:', error);
        showNotification('Ürünler yüklenemedi: ' + error.message, 'error');
    });
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Add active to clicked menu item if event exists
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    if (sectionName === 'products') {
        loadProductsFromBackend();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add product form
    document.getElementById('add-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editId = this.dataset.editId;
        if (editId) {
            updateProduct(editId);
        } else {
            addProduct();
        }
    });
}

// Update product
function updateProduct(id) {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;
    const price = parseInt(document.getElementById('product-price').value);
    const oldPrice = parseInt(document.getElementById('product-old-price').value) || null;
    const stock = parseInt(document.getElementById('product-stock').value);
    const badge = document.getElementById('product-badge').value;
    const featured = document.getElementById('product-featured').checked;
    
    const productData = {
        name,
        category,
        description,
        price,
        oldPrice,
        stock,
        badge,
        featured
    };
    
    fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Reset form
        const form = document.getElementById('add-product-form');
        form.reset();
        document.getElementById('product-featured').checked = false;
        form.querySelector('button[type="submit"]').textContent = 'Ürün Ekle';
        delete form.dataset.editId;
        
        showNotification(data.message || 'Ürün başarıyla güncellendi!', 'success');
        showSection('products');
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Güncelleme hatası: ' + error.message, 'error');
    });
}

// Load products into table
function loadProducts() {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.stock}</td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${product.featured ? 'checked' : ''} onchange="toggleFeatured(${product.id}, this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <button class="btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add new product
function addProduct() {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;
    const price = parseInt(document.getElementById('product-price').value);
    const oldPrice = parseInt(document.getElementById('product-old-price').value) || null;
    const stock = parseInt(document.getElementById('product-stock').value);
    const badge = document.getElementById('product-badge').value;
    const featured = document.getElementById('product-featured').checked;
    
    const productData = {
        name,
        category,
        description,
        price,
        oldPrice,
        stock,
        badge,
        featured: featured === true
    };
    
    // Send to backend
    fetch('http://localhost:3000/api/products/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.product) {
            // Clear form
            const form = document.getElementById('add-product-form');
            form.reset();
            document.getElementById('product-featured').checked = false;
            
            // Show notification
            showNotification(data.message || 'Ürün başarıyla eklendi!', 'success');
            
            // Switch to products view and reload
            showSection('products');
        } else {
            showNotification(data.message || 'Hata oluştu', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Bağlantı hatası: ' + error.message, 'error');
    });
}

// Edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    // Fill form with product data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-old-price').value = product.oldPrice || '';
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-badge').value = product.badge || '';
    document.getElementById('product-featured').checked = product.featured || false;
    
    // Change form to edit mode
    const form = document.getElementById('add-product-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Ürünü Güncelle';
    
    // Store product ID for update
    form.dataset.editId = id;
    
    // Switch to add product section
    showSection('add-product');
}

// Delete product
function deleteProduct(id) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        // Send to backend
        fetch(`http://localhost:3000/api/products/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                // Show notification
                showNotification(data.message, 'success');
                // Reload products
                loadProductsFromBackend();
            } else {
                showNotification('Hata oluştu', 'error');
            }
        })
        .catch(error => {
            console.error('Delete error:', error);
            showNotification('Bağlantı hatası: ' + error.message, 'error');
        });
    }
}



// Get category name
function getCategoryName(category) {
    const categories = {
        'phone': 'Telefon',
        'tablet': 'Tablet',
        'accessory': 'Aksesuar',
        'computer': 'Bilgisayar'
    };
    return categories[category] || category;
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(price);
}

// Show notification
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
        border-radius: 5px; color: white; font-weight: bold; z-index: 10000;
        animation: slideIn 0.3s ease; max-width: 300px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3000);
}

// Add CSS
if (!document.querySelector('#notification-css')) {
    const style = document.createElement('style');
    style.id = 'notification-css';
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }';
    document.head.appendChild(style);
}

// Toggle featured status
function toggleFeatured(id, featured) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const productData = {
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        stock: product.stock,
        badge: product.badge,
        featured: featured
    };
    
    fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        showNotification(featured ? 'Ürün öne çıkarıldı!' : 'Ürün öne çıkarılmaktan çıkarıldı!', 'success');
        loadProductsFromBackend();
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Güncelleme hatası: ' + error.message, 'error');
        // Revert checkbox state
        loadProductsFromBackend();
    });
}

// Make functions global
window.showSection = showSection;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.toggleFeatured = toggleFeatured;