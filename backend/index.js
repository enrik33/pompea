const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/recommend-tour', async (req, res) => {
    const { experience, duration, preference } = req.body;

    const prompt = `
You're a smart tour recommender for Pompea Tours in Albania. Based on the user's preferences, recommend ONE of the following tours and give a **concise, clear description (max 2 short sentences)** why it's a great fit:

Here are the tour options:

1. Butrinti & Blue Eye – Best for: Short (3–4h), nature, relaxation.
2. Saranda & Gjirokastra – Best for: Standard (5–6h), culture, history.
3. Museum Package – Best for: Full (7–9h), history, both.
4. Permeti – Best for: Full (7–9h), nature, adventure.
5. Himara – Best for: Full (7–9h), coastal nature, relaxation.
6. Gjirokastra + Blue Eye – Best for: Full (7–9h), both, adventure.
7. Butrinti & Saranda Highlights – Best for: Full (7–9h), history + swimming, all-around mix.

The user wants:
- Experience: ${experience}
- Duration (Short / Standard / Full): ${duration}
- Preference: ${preference}

Recommend the best matching tour from the list above. 
`;


    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const recommendation = response.choices[0].message.content;
        res.json({ recommendation });
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Booking endpoint
app.post("/book", async (req, res) => {

    const {
        tourName,
        date,
        groupSize,
        name,
        email,
        phone,
        paymentMethod,
        specialRequests,
    } = req.body;

    if (
        !["paypal", "bank_transfer", "cash"].includes(paymentMethod) ||
        isNaN(groupSize) || groupSize < 2 || groupSize > 6 ||
        !/^[A-Za-z\s]{2,50}$/.test(name) ||
        !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) ||
        !/^\+?\d{8,15}$/.test(phone)
    ) {
        return res.status(400).json({ error: "Invalid input data." });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Insert or find user
        const [existingUser] = await connection.query(
            "SELECT id FROM users WHERE email = ? AND phone = ?",
            [email, phone]
        );

        let userId;

        if (existingUser.length > 0) {
            userId = existingUser[0].id;
        } else {
            const [userInsert] = await connection.query(
                "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
                [name, email, phone]
            );
            userId = userInsert.insertId;
        }

        // Find tour ID
        const [tourResult] = await connection.query(
            "SELECT id FROM tours WHERE title = ?",
            [tourName.trim()]
        );

        if (tourResult.length === 0) {
            throw new Error("Invalid tour name");
        }

        const tourId = tourResult[0].id;

        // Insert booking
        await connection.query(
            `INSERT INTO bookings (user_id, tour_id, booking_date, num_people, total_price, payment_method, special_requests, language)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, tourId, date, groupSize, 0, paymentMethod, specialRequests || null, language]
        );

        await connection.commit();
        res.json({ message: "Reservation received! You’ll get a confirmation email soon." });
    } catch (error) {
        await connection.rollback();
        console.error("Booking error:", error);
        res.status(500).json({ error: "Could not complete reservation." });
    } finally {
        connection.release();
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Pompea AI backend running on port ${PORT}`));
