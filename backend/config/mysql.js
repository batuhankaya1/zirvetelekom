const mysql = require("mysql2/promise");

// MySQL connection configuration
const dbConfig = {
  host: "localhost",
  user: process.env.NODE_ENV === "production" ? "zirveapp" : "root",
  password: process.env.NODE_ENV === "production" ? "StrongPassword123!" : "",
  database: "zirvetelekom",
  charset: "utf8mb4",
    host: 'localhost',
    user: process.env.NODE_ENV === 'production' ? 'root' : 'root',
    password: process.env.NODE_ENV === 'production' ? '' : '',
    database: 'zirvetelekom',
    charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database
async function initializeDatabase() {
  try {
    // Create database if not exists
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.end();

    console.log("MySQL database created/verified");

    // Create tables
    await createTables();
    await insertSampleData();
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
}

// Create database tables
async function createTables() {
  try {
    // Products table
    await pool.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT,
                price INT NOT NULL,
                old_price INT NULL,
                stock INT DEFAULT 0,
                badge VARCHAR(50),
                image VARCHAR(255) DEFAULT '/images/default.jpg',
                featured BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    // Users table
    await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    // User profiles table
    await pool.execute(`
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(20),
                birth_date DATE,
                gender ENUM('male', 'female', 'other'),
                address TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    // Orders table
    await pool.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                total_amount INT NOT NULL,
                status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                shipping_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    // Order items table
    await pool.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                product_id INT,
                quantity INT NOT NULL,
                price INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    // Cart table for session-based carts
    await pool.execute(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(255) NOT NULL,
                user_id INT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_session_product (session_id, product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    console.log("MySQL tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    // Insert sample products
    const [productRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM products"
    );

    if (productRows[0].count === 0) {
      const sampleProducts = [
        [
          "iPhone 15 Pro",
          "phone",
          "A17 Pro çip, Titanium tasarım",
          49999,
          54999,
          50,
          "YENİ",
        ],
        [
          "Samsung Galaxy S24",
          "phone",
          "AI destekli kamera, 120Hz ekran",
          34999,
          39999,
          30,
          "POPÜLER",
        ],
        [
          "iPad Air",
          "tablet",
          "M1 çip, 10.9 inç Liquid Retina ekran",
          19999,
          24999,
          25,
          "İNDİRİM",
        ],
        [
          "MacBook Air M2",
          "laptop",
          "13.6 inç, M2 çip, 8GB RAM",
          39999,
          44999,
          15,
          "YENİ",
        ],
        [
          "AirPods Pro",
          "accessory",
          "Aktif Gürültü Engelleme",
          8999,
          9999,
          40,
          "POPÜLER",
        ],
      ];

      for (const product of sampleProducts) {
        await pool.execute(
          `
                    INSERT INTO products (name, category, description, price, old_price, stock, badge)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
          product
        );
      }

      console.log("Sample products inserted");
    }

    // Insert sample users
    const [userRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM users"
    );

    if (userRows[0].count === 0) {
      const sampleUsers = [
        ["Test Kullanıcı", "test@example.com", "123456"],
        ["Admin User", "admin@zirvetelekom.com", "admin123"],
        ["Demo User", "demo@example.com", "demo123"],
      ];

      for (const user of sampleUsers) {
        await pool.execute(
          `
                    INSERT INTO users (name, email, password)
                    VALUES (?, ?, ?)
                `,
          user
        );
      }

      console.log("Sample users inserted");
    }
  } catch (error) {
    console.error("Error inserting sample data:", error);
  }
}

module.exports = { pool, initializeDatabase };
