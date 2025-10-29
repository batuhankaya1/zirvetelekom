const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all order items
router.get('/', (req, res) => {
    const query = `
        SELECT oi.*, p.name as product_name, o.created_at as order_date
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN orders o ON oi.order_id = o.id
        ORDER BY oi.id DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(rows);
    });
});

// GET order items by order ID
router.get('/order/:orderId', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    
    const query = `
        SELECT oi.*, p.name as product_name, p.image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    `;
    
    db.all(query, [orderId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;