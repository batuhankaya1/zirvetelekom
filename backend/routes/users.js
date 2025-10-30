const express = require('express');
const router = express.Router();
const { pool } = require('../config/mysql');

// GET all users (admin)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
        
        const users = rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            createdAt: row.created_at
        }));
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// POST register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
        }
        
        // Check if user exists
        const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Bu email zaten kayıtlı' });
        }
        
        // Create new user
        const [result] = await pool.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
        
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// POST login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email ve şifre gereklidir' });
        }
        
        const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE email = ? AND password = ?', [email, password]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }
        
        const user = rows[0];
        res.json({ message: 'Giriş başarılı', userId: user.id, name: user.name });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// DELETE user (admin)
router.delete('/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // First get the user to return it
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        
        const user = rows[0];
        
        // Delete the user
        await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        
        res.json({ message: 'Kullanıcı başarıyla silindi', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// GET user profile
router.get('/profile/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const [rows] = await pool.execute('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
        
        const profile = rows.length > 0 ? {
            firstName: rows[0].first_name,
            lastName: rows[0].last_name,
            phone: rows[0].phone,
            birthDate: rows[0].birth_date,
            gender: rows[0].gender,
            address: rows[0].address
        } : null;
        
        res.json({ profile });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// PUT update user profile
router.put('/profile/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { firstName, lastName, phone, birthDate, gender, address } = req.body;
        
        // Check if profile exists
        const [rows] = await pool.execute('SELECT id FROM user_profiles WHERE user_id = ?', [userId]);
        
        if (rows.length > 0) {
            // Update existing profile
            await pool.execute(`
                UPDATE user_profiles 
                SET first_name = ?, last_name = ?, phone = ?, birth_date = ?, 
                    gender = ?, address = ?
                WHERE user_id = ?
            `, [firstName, lastName, phone, birthDate, gender, address, userId]);
            
            res.json({ message: 'Profil başarıyla güncellendi' });
        } else {
            // Create new profile
            await pool.execute(`
                INSERT INTO user_profiles (user_id, first_name, last_name, phone, birth_date, gender, address)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [userId, firstName, lastName, phone, birthDate, gender, address]);
            
            res.json({ message: 'Profil başarıyla oluşturuldu' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// PUT change password
router.put('/change-password/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { currentPassword, newPassword } = req.body;
        
        // Verify current password
        const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [userId]);
        
        if (rows.length === 0 || rows[0].password !== currentPassword) {
            return res.json({ message: 'Mevcut şifre yanlış', success: false });
        }
        
        // Update password
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
        res.json({ message: 'Şifre başarıyla değiştirildi', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Debug endpoint - check users table
router.get('/debug/count', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [allUsers] = await pool.execute('SELECT id, name, email FROM users LIMIT 5');
        res.json({ 
            userCount: rows[0].count,
            sampleUsers: allUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

module.exports = router;