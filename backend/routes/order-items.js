const express = require('express');
const router = express.Router();
const { pool } = require('../config/mysql');

// GET all order items
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT oi.*, p.name as product_name, o.created_at as order_date
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN orders o ON oi.order_id = o.id
            ORDER BY oi.id DESC
        `);
        
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// GET order items by order ID
router.get('/order/:orderId', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        
        const [rows] = await pool.execute(`
            SELECT oi.*, p.name as product_name, p.image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);
        
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

module.exports = router;