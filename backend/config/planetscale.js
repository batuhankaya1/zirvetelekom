const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'aws.connect.psdb.cloud',
    username: 'your-username',
    password: 'your-password',
    database: 'zirvetelekom',
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = { pool };