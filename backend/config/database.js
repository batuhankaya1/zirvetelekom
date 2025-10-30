const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to SQLite database');
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Create products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            old_price INTEGER,
            stock INTEGER DEFAULT 0,
            badge TEXT,
            image TEXT DEFAULT '/images/default.jpg',
            featured INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating products table:', err.message);
        } else {
            console.log('Products table ready');
            // Add featured column if it doesn't exist
            db.run('ALTER TABLE products ADD COLUMN featured INTEGER DEFAULT 0', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding featured column:', err.message);
                }
            });
            insertSampleData();
        }
    });

    // Create orders table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_amount INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create order_items table
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            price INTEGER NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    `);

    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready');
        }
    });

    // Create user_profiles table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            birth_date DATE,
            gender TEXT,
            address TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating user_profiles table:', err.message);
        } else {
            console.log('User profiles table ready');
        }
    });
}

// Insert sample data if products table is empty
function insertSampleData() {
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
            console.error('Error checking products:', err.message);
            return;
        }

        if (row.count === 0) {
            const sampleProducts = [
                {
                    name: 'iPhone 15 Pro',
                    category: 'phone',
                    description: 'A17 Pro çip, Titanium tasarım',
                    price: 49999,
                    old_price: 54999,
                    stock: 50,
                    badge: 'YENİ'
                },
                {
                    name: 'Samsung Galaxy S24',
                    category: 'phone',
                    description: 'AI destekli kamera, 120Hz ekran',
                    price: 34999,
                    old_price: 39999,
                    stock: 30,
                    badge: 'POPÜLER'
                },
                {
                    name: 'iPad Air',
                    category: 'tablet',
                    description: 'M1 çip, 10.9 inç Liquid Retina ekran',
                    price: 19999,
                    old_price: 24999,
                    stock: 25,
                    badge: 'İNDİRİM'
                }
            ];

            const stmt = db.prepare(`
                INSERT INTO products (name, category, description, price, old_price, stock, badge)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            sampleProducts.forEach(product => {
                stmt.run([
                    product.name,
                    product.category,
                    product.description,
                    product.price,
                    product.old_price,
                    product.stock,
                    product.badge
                ]);
            });

            stmt.finalize();
            console.log('Sample products inserted');
        }
    });
}

module.exports = db;