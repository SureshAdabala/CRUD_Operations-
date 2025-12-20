require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetUsers() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false }
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log("Connected to MySQL server.");

        // 1. Delete all users
        await connection.query('DELETE FROM users');
        console.log("⚠️  All existing users have been deleted.");

        // 2. Insert Default Admin
        const defaultAdmin = {
            username: 'Default Admin',
            email: 'sureshadabala0836@gmail.com',
            password: 'Suresh@23',
            role: 'admin'
        };

        await connection.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [defaultAdmin.username, defaultAdmin.email, defaultAdmin.password, defaultAdmin.role]
        );
        console.log(`✅ Default Admin restored: ${defaultAdmin.email}`);

        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error("❌ Reset failed:", error.message);
        process.exit(1);
    }
}

resetUsers();
