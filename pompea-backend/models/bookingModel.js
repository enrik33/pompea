import db from "../config/db.js";

export const createBooking = (userName, email, tourId, tourName, totalPrice, stripePaymentId, callback) => {
    const sql = `INSERT INTO bookings (user_name, email, tour_id, tour_name, total_price, payment_status, stripe_payment_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [userName, email, tourId, tourName, totalPrice, "pending", stripePaymentId], callback);
};

export const updateBookingStatus = (paymentId, status, callback) => {
    const sql = `UPDATE bookings SET payment_status = ? WHERE stripe_payment_id = ?`;
    db.query(sql, [status, paymentId], callback);
};
