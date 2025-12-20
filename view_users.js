require('dotenv').config();
const mysql = require('mysql2/promise');

async function viewUsers() {
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
        console.log("✅ Custom Tool: Connecting to Aiven Cloud Database...");

        const [rows] = await connection.query('SELECT * FROM users');

        console.log("\n📋 Registered Users List:");
        console.table(rows);

        await connection.end();
    } catch (error) {
        console.error("❌ Error fetching data:", error.message);
    }
}

viewUsers();
