const express = require('express');
const router = express.Router();
const { pool } = require('../config/mysql');

// GET all products
router.get('/', async (req, res) => {
    try {
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

        const [rows] = await pool.execute(query, params);
        
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
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// GET featured products (must be before /:id route)
router.get('/featured', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM products WHERE featured = 1 ORDER BY created_at DESC');
        
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
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        const row = rows[0];
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
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// POST add product (admin)
router.post('/add', async (req, res) => {
    try {
        const { name, category, price, oldPrice, description, stock, badge, featured } = req.body;
        
        if (!name || !category || !price) {
            return res.status(400).json({ message: 'Gerekli alanlar eksik' });
        }
        
        const query = `
            INSERT INTO products (name, category, description, price, old_price, stock, badge, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const featuredValue = (featured === true || featured === 'true' || featured === 1) ? 1 : 0;
        
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
        
        const [result] = await pool.execute(query, params);
        
        // Get the inserted product
        const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
        const row = rows[0];
        
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
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// DELETE product (admin)
router.delete('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        // First get the product to return it
        const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        const row = rows[0];
        
        // Delete the product
        await pool.execute('DELETE FROM products WHERE id = ?', [productId]);
        
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
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// PUT update product (admin)
router.put('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, category, price, oldPrice, description, stock, badge, featured } = req.body;
        
        const query = `
            UPDATE products 
            SET name = ?, category = ?, description = ?, price = ?, old_price = ?, 
                stock = ?, badge = ?, featured = ?
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
        
        const [result] = await pool.execute(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        // Get updated product
        const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
        const row = rows[0];
        
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
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// POST update stock (for orders)
router.post('/:id/update-stock', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { quantity } = req.body;
        
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Geçersiz miktar' });
        }
        
        // Check current stock
        const [rows] = await pool.execute('SELECT stock FROM products WHERE id = ?', [productId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        const row = rows[0];
        if (row.stock < quantity) {
            return res.status(400).json({ 
                message: 'Yetersiz stok', 
                availableStock: row.stock 
            });
        }
        
        // Update stock
        const newStock = row.stock - quantity;
        await pool.execute('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
        
        res.json({ 
            message: 'Stok güncellendi', 
            newStock: newStock,
            soldQuantity: quantity
        });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// GET low stock products
router.get('/low-stock/:threshold?', async (req, res) => {
    try {
        const threshold = parseInt(req.params.threshold) || 10;
        const [rows] = await pool.execute('SELECT * FROM products WHERE stock <= ? ORDER BY stock ASC', [threshold]);
        
        const products = rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            stock: row.stock,
            price: row.price
        }));
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

module.exports = router;