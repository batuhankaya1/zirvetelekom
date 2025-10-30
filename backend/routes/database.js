const express = require('express');
const router = express.Router();
const { pool } = require('../config/mysql');

// GET all tables info
router.get('/tables', async (req, res) => {
    try {
        const [rows] = await pool.execute("SHOW TABLES");
        const tables = rows.map(row => Object.values(row)[0]);
        res.json({ tables });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET table schema
router.get('/schema/:tableName', async (req, res) => {
    try {
        const tableName = req.params.tableName;
        const [rows] = await pool.execute(`DESCRIBE ${tableName}`);
        res.json({ schema: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST execute custom query (SELECT only for security)
router.post('/query', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        // Security check - only allow SELECT queries
        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery.startsWith('select')) {
            return res.status(403).json({ error: 'Only SELECT queries are allowed' });
        }
        
        // Additional security checks
        const forbiddenKeywords = ['drop', 'delete', 'insert', 'update', 'alter', 'create'];
        const hasForbidenKeyword = forbiddenKeywords.some(keyword => 
            trimmedQuery.includes(keyword.toLowerCase())
        );
        
        if (hasForbidenKeyword) {
            return res.status(403).json({ error: 'Query contains forbidden keywords' });
        }
        
        const [rows] = await pool.execute(query);
        res.json({ results: rows });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET database statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = {};
        
        // Get products count
        const [productsResult] = await pool.execute('SELECT COUNT(*) as count FROM products');
        stats.products = productsResult[0].count;
        
        // Get orders count
        try {
            const [ordersResult] = await pool.execute('SELECT COUNT(*) as count FROM orders');
            stats.orders = ordersResult[0].count;
        } catch {
            stats.orders = 0;
        }
        
        // Get low stock products
        try {
            const [lowStockResult] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock <= 10');
            stats.lowStock = lowStockResult[0].count;
        } catch {
            stats.lowStock = 0;
        }
        
        // Get total value
        try {
            const [totalValueResult] = await pool.execute('SELECT SUM(price * stock) as total FROM products');
            stats.totalValue = totalValueResult[0].total || 0;
        } catch {
            stats.totalValue = 0;
        }
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;