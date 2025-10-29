const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all products
router.get('/', (req, res) => {
    const { category, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (minPrice) {
        query += ' AND price >= ?';
        params.push(parseInt(minPrice));
    }

    if (maxPrice) {
        query += ' AND price <= ?';
        params.push(parseInt(maxPrice));
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        // Convert snake_case to camelCase for frontend
        const products = rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            price: row.price,
            oldPrice: row.old_price,
            stock: row.stock,
            badge: row.badge,
            image: row.image,
            featured: row.featured
        }));
        
        res.json(products);
    });
});

// GET featured products (must be before /:id route)
router.get('/featured', (req, res) => {
    db.all('SELECT * FROM products WHERE featured = 1 ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        console.log('Featured products query result:', rows);
        
        const products = rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            price: row.price,
            oldPrice: row.old_price,
            stock: row.stock,
            badge: row.badge,
            image: row.image,
            featured: row.featured
        }));
        
        res.json(products);
    });
});

// GET single product
router.get('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        const product = {
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            price: row.price,
            oldPrice: row.old_price,
            stock: row.stock,
            badge: row.badge,
            image: row.image,
            featured: row.featured
        };
        
        res.json(product);
    });
});

// POST add product (admin)
router.post('/add', (req, res) => {
    const { name, category, price, oldPrice, description, stock, badge, featured } = req.body;
    
    console.log('Adding product with featured:', featured, typeof featured);
    
    if (!name || !category || !price) {
        return res.status(400).json({ message: 'Gerekli alanlar eksik' });
    }
    
    const query = `
        INSERT INTO products (name, category, description, price, old_price, stock, badge, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const featuredValue = (featured === true || featured === 'true' || featured === 1) ? 1 : 0;
    console.log('Featured value will be:', featuredValue);
    
    const params = [
        name,
        category,
        description || '',
        parseInt(price),
        oldPrice ? parseInt(oldPrice) : null,
        parseInt(stock) || 0,
        badge || '',
        featuredValue
    ];
    
    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        // Get the inserted product
        db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            
            const product = {
                id: row.id,
                name: row.name,
                category: row.category,
                description: row.description,
                price: row.price,
                oldPrice: row.old_price,
                stock: row.stock,
                badge: row.badge,
                image: row.image
            };
            
            res.status(201).json({ message: 'Ürün başarıyla eklendi', product });
        });
    });
});

// DELETE product (admin)
router.delete('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    
    // First get the product to return it
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        // Delete the product
        db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            
            const deletedProduct = {
                id: row.id,
                name: row.name,
                category: row.category,
                description: row.description,
                price: row.price,
                oldPrice: row.old_price,
                stock: row.stock,
                badge: row.badge,
                image: row.image
            };
            
            res.json({ message: 'Ürün başarıyla silindi', product: deletedProduct });
        });
    });
});

// PUT update product (admin)
router.put('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, category, price, oldPrice, description, stock, badge, featured } = req.body;
    
    const query = `
        UPDATE products 
        SET name = ?, category = ?, description = ?, price = ?, old_price = ?, 
            stock = ?, badge = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    const params = [
        name,
        category,
        description,
        parseInt(price),
        oldPrice ? parseInt(oldPrice) : null,
        parseInt(stock),
        badge,
        featured ? 1 : 0,
        productId
    ];
    
    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        // Get updated product
        db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            
            const product = {
                id: row.id,
                name: row.name,
                category: row.category,
                description: row.description,
                price: row.price,
                oldPrice: row.old_price,
                stock: row.stock,
                badge: row.badge,
                image: row.image
            };
            
            res.json({ message: 'Ürün başarıyla güncellendi', product });
        });
    });
});

// POST update stock (for orders)
router.post('/:id/update-stock', (req, res) => {
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Geçersiz miktar' });
    }
    
    // Check current stock
    db.get('SELECT stock FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        if (row.stock < quantity) {
            return res.status(400).json({ 
                message: 'Yetersiz stok', 
                availableStock: row.stock 
            });
        }
        
        // Update stock
        const newStock = row.stock - quantity;
        db.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            
            res.json({ 
                message: 'Stok güncellendi', 
                newStock: newStock,
                soldQuantity: quantity
            });
        });
    });
});

// GET low stock products
router.get('/low-stock/:threshold?', (req, res) => {
    const threshold = parseInt(req.params.threshold) || 10;
    
    db.all('SELECT * FROM products WHERE stock <= ? ORDER BY stock ASC', [threshold], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        const products = rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            stock: row.stock,
            price: row.price
        }));
        
        res.json(products);
    });
});

module.exports = router;