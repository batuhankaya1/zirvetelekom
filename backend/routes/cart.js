const express = require('express');
const router = express.Router();
const { pool } = require('../config/mysql');

// Generate session ID if not exists
function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// GET cart items
router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.query;
        
        let query = `
            SELECT c.*, p.name, p.price, p.image, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.session_id = ?
        `;
        let params = [sessionId];
        
        if (userId) {
            query += ' OR c.user_id = ?';
            params.push(parseInt(userId));
        }
        
        const [rows] = await pool.execute(query, params);
        
        const cartItems = rows.map(row => ({
            id: row.id,
            productId: row.product_id,
            name: row.name,
            price: row.price,
            quantity: row.quantity,
            image: row.image,
            stock: row.stock,
            total: row.price * row.quantity
        }));
        
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// POST add to cart
router.post('/add', async (req, res) => {
    try {
        const { sessionId, userId, productId, quantity = 1 } = req.body;
        
        if (!sessionId || !productId) {
            return res.status(400).json({ message: 'Session ID ve Product ID gerekli' });
        }
        
        // Check if product exists and has stock
        const [productRows] = await pool.execute('SELECT stock FROM products WHERE id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        if (productRows[0].stock < quantity) {
            return res.status(400).json({ message: 'Yetersiz stok' });
        }
        
        // Check if item already in cart
        const [existingRows] = await pool.execute(
            'SELECT * FROM cart WHERE session_id = ? AND product_id = ?',
            [sessionId, productId]
        );
        
        if (existingRows.length > 0) {
            // Update quantity
            const newQuantity = existingRows[0].quantity + quantity;
            
            if (productRows[0].stock < newQuantity) {
                return res.status(400).json({ message: 'Yetersiz stok' });
            }
            
            await pool.execute(
                'UPDATE cart SET quantity = ?, user_id = ? WHERE session_id = ? AND product_id = ?',
                [newQuantity, userId || null, sessionId, productId]
            );
        } else {
            // Add new item
            await pool.execute(
                'INSERT INTO cart (session_id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)',
                [sessionId, userId || null, productId, quantity]
            );
        }
        
        res.json({ message: 'Ürün sepete eklendi' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// PUT update cart item quantity
router.put('/update', async (req, res) => {
    try {
        const { sessionId, productId, quantity } = req.body;
        
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            await pool.execute(
                'DELETE FROM cart WHERE session_id = ? AND product_id = ?',
                [sessionId, productId]
            );
        } else {
            // Check stock
            const [productRows] = await pool.execute('SELECT stock FROM products WHERE id = ?', [productId]);
            
            if (productRows.length === 0) {
                return res.status(404).json({ message: 'Ürün bulunamadı' });
            }
            
            if (productRows[0].stock < quantity) {
                return res.status(400).json({ message: 'Yetersiz stok' });
            }
            
            await pool.execute(
                'UPDATE cart SET quantity = ? WHERE session_id = ? AND product_id = ?',
                [quantity, sessionId, productId]
            );
        }
        
        res.json({ message: 'Sepet güncellendi' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// DELETE remove from cart
router.delete('/remove', async (req, res) => {
    try {
        const { sessionId, productId } = req.body;
        
        await pool.execute(
            'DELETE FROM cart WHERE session_id = ? AND product_id = ?',
            [sessionId, productId]
        );
        
        res.json({ message: 'Ürün sepetten kaldırıldı' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// DELETE clear cart
router.delete('/clear/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        await pool.execute('DELETE FROM cart WHERE session_id = ?', [sessionId]);
        
        res.json({ message: 'Sepet temizlendi' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// POST generate session
router.post('/session', (req, res) => {
    const sessionId = generateSessionId();
    res.json({ sessionId });
});

module.exports = router;