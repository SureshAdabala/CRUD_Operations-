
const mysql = require('mysql2/promise');

async function setupDatabase() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: 'root', // As provided by user
    };

    try {
        // Connect to MySQL server
        const connection = await mysql.createConnection(config);
        console.log("Connected to MySQL server.");

        // Create Database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS user_dashboard_db`);
        console.log("Database 'user_dashboard_db' checks out.");

        // Use the database
        await connection.query(`USE user_dashboard_db`);

        // Create Users Table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createTableQuery);
        console.log("Table 'users' checks out.");

        // Insert Default Admin (root)
        const [rows] = await connection.query(`SELECT * FROM users WHERE username = 'root'`);
        if (rows.length === 0) {
            await connection.query(`
                INSERT INTO users (username, email, password, role) 
                VALUES ('root', 'root@example.com', 'root', 'admin')
            `);
            console.log("Default user 'root' created.");
        } else {
            console.log("User 'root' already exists.");
        }

        console.log("Database setup completed successfully.");
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error("Database setup failed:", error.message);
        process.exit(1);
    }
}

setupDatabase();
