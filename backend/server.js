const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/order-items', require('./routes/order-items'));
app.use('/api/database', require('./routes/database'));

// Health check
app.get('/api/health', (req, res) => {
    db.get('SELECT 1', (err) => {
        if (err) {
            res.status(500).json({ status: 'error', message: 'Database connection failed' });
        } else {
            res.json({ status: 'ok', message: 'Database connected' });
        }
    });
});

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/pages/*', (req, res) => {
    const pagePath = path.join(__dirname, '../frontend', req.path);
    res.sendFile(pagePath);
});

// Catch all other routes and serve index.html
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Frontend and Backend on same port!');
});