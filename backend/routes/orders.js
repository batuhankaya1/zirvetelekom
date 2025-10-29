const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Sample orders data (fallback)
let orders = [];

// POST create order
router.post('/', (req, res) => {
    const { userId, products, totalAmount, shippingAddress } = req.body;
    
    const query = `
        INSERT INTO orders (user_id, total_amount, shipping_address, status)
        VALUES (?, ?, ?, 'pending')
    `;
    
    db.run(query, [userId, totalAmount, shippingAddress], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        const orderId = this.lastID;
        
        // Insert order items
        if (products && products.length > 0) {
            const itemQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
            const stmt = db.prepare(itemQuery);
            
            products.forEach(product => {
                stmt.run([orderId, product.id, product.quantity, product.price]);
            });
            
            stmt.finalize();
        }
        
        res.status(201).json({ message: 'Sipariş oluşturuldu', orderId: orderId });
    });
});

// GET all orders
router.get('/', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(rows);
    });
});

// GET user orders
router.get('/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(rows);
    });
});

// GET single order
router.get('/:id', (req, res) => {
    const orderId = parseInt(req.params.id);
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        res.json(row);
    });
});

module.exports = router;