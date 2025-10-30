const express = require('express');
const router = express.Router();
const { pool } = require('../config/mysql');

// Sample orders data (fallback)
let orders = [];

// POST create order
router.post('/', async (req, res) => {
    try {
        const { userId, products, totalAmount, shippingAddress } = req.body;
        
        const [result] = await pool.execute(`
            INSERT INTO orders (user_id, total_amount, shipping_address, status)
            VALUES (?, ?, ?, 'pending')
        `, [userId, totalAmount, shippingAddress]);
        
        const orderId = result.insertId;
        
        // Insert order items
        if (products && products.length > 0) {
            for (const product of products) {
                await pool.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, product.id, product.quantity, product.price]
                );
            }
        }
        
        res.status(201).json({ message: 'Sipariş oluşturuldu', orderId: orderId });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// GET all orders
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// GET user orders
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const [rows] = await pool.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// GET single order
router.get('/:id', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

module.exports = router;