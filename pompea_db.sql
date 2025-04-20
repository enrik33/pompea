CREATE DATABASE IF NOT EXISTS pompea;
USE pompea;

-- USERS (clients booking tours)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

-- TOURS (basic info for each tour)
CREATE TABLE tours (
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
);

-- TOUR PRICING (final price and profit based on group size)
CREATE TABLE tour_pricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT,
    num_adults INT,
    final_price DECIMAL(10, 2),
    profit DECIMAL(10, 2),
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- BOOKINGS (tour reservations)
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tour_id INT,
    booking_date DATE,
    num_people INT,
    total_price DECIMAL(10, 2),
    payment_method ENUM('paypal', 'bank_transfer', 'cash') NOT NULL,
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tour_id) REFERENCES tours(id)
);

ALTER TABLE bookings ADD COLUMN language VARCHAR(20) DEFAULT 'english';

SELECT * FROM bookings;

SELECT * FROM tours;

