const pool = require("./db");

async function createTables() {
    try {
        const connection = await pool.getConnection();

        await connection.query(`CREATE DATABASE IF NOT EXISTS pompea`);
        await connection.query(`USE pompea`);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL
      )
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration_hours INT,
        includes_lunch BOOLEAN,
        includes_entry BOOLEAN,
        includes_guide BOOLEAN,
        fixed_driver_cost DECIMAL(10, 2),
        entry_fee_per_person DECIMAL(10, 2),
        lunch_cost_per_person DECIMAL(10, 2),
        markup_percentage DECIMAL(5, 2),
        vat_percentage DECIMAL(5, 2),
        fixed_tax_buffer DECIMAL(10, 2)
      )
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS tour_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tour_id INT,
        num_adults INT,
        final_price DECIMAL(10, 2),
        profit DECIMAL(10, 2),
        FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
      )
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        tour_id INT,
        booking_date DATE,
        num_people INT CHECK (num_people BETWEEN 2 AND 6),
        total_price DECIMAL(10, 2),
        payment_method ENUM('paypal', 'bank_transfer', 'cash') NOT NULL,
        payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (tour_id) REFERENCES tours(id)
      )
    `);

        console.log("✅ All tables created successfully!");
        connection.release();
    } catch (err) {
        console.error("❌ Error creating tables:", err);
    }
}

createTables();
