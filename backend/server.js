const express = require('express');
const cors = require('cors');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';
const config = isDev ? require('./config/mysql') : require('./config/production');
const { pool } = config;
const { initializeDatabase } = isDev ? config : { initializeDatabase: () => Promise.resolve() };

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
app.use('/api/cart', require('./routes/cart'));

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.json({ status: 'ok', message: 'MySQL database connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
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

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Frontend and Backend on same port!');
        console.log('MySQL database initialized');
    });
}).catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});