const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all tables info
router.get('/tables', (req, res) => {
    const query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const tables = rows.map(row => row.name);
        res.json({ tables });
    });
});

// GET table schema
router.get('/schema/:tableName', (req, res) => {
    const tableName = req.params.tableName;
    const query = `PRAGMA table_info(${tableName})`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({ schema: rows });
    });
});

// POST execute custom query (SELECT only for security)
router.post('/query', (req, res) => {
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
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        res.json({ results: rows });
    });
});

// GET database statistics
router.get('/stats', (req, res) => {
    const stats = {};
    
    // Get products count
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        stats.products = row.count;
        
        // Get orders count
        db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
            if (err) {
                stats.orders = 0;
            } else {
                stats.orders = row.count;
            }
            
            // Get low stock products
            db.get('SELECT COUNT(*) as count FROM products WHERE stock <= 10', (err, row) => {
                if (err) {
                    stats.lowStock = 0;
                } else {
                    stats.lowStock = row.count;
                }
                
                // Get total value
                db.get('SELECT SUM(price * stock) as total FROM products', (err, row) => {
                    if (err) {
                        stats.totalValue = 0;
                    } else {
                        stats.totalValue = row.total || 0;
                    }
                    
                    res.json(stats);
                });
            });
        });
    });
});

module.exports = router;