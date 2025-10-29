const express = require('express');
const router = express.Router();

// Sample users data
let users = [];

// POST register
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'Bu email zaten kayıtlı' });
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password, // In production, hash this password
        createdAt: new Date()
    };
    
    users.push(newUser);
    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu', userId: newUser.id });
});

// POST login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }
    
    res.json({ message: 'Giriş başarılı', userId: user.id, name: user.name });
});

module.exports = router;