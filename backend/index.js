const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const nodemailer = require('nodemailer');
const OpenAI = require("openai");
const path = require('path');
const helmet = require('helmet');

dotenv.config();

const app = express();
const corsOptions = {
    origin: [
        'https://www.pompeatours.com',
        'https://pompeatours.com',
        'https://pompea-tours.onrender.com',
        'https://enrik33.github.io',
        'http://localhost:4000'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],

                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://code.jquery.com",
                    "https://cdn.jsdelivr.net",
                    "https://unpkg.com",
                    "https://www.paypal.com",
                    "https://www.sandbox.paypal.com",
                    "https://www.paypalobjects.com",
                    "https://www.gstatic.com",
                    "https://www.google.com",
                    "https://*.paypal.com",
                    "https://*.paypalobjects.com",
                    "https://*.doubleclick.net"
                ],

                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com",
                    "https://cdnjs.cloudflare.com",
                    "https://cdn.jsdelivr.net",
                    "https://unpkg.com"
                ],

                fontSrc: [
                    "'self'",
                    "https://fonts.gstatic.com",
                    "https://cdnjs.cloudflare.com"
                ],

                imgSrc: [
                    "'self'",
                    "data:",
                    "https:",
                    "https://*.paypal.com",
                    "https://*.paypalobjects.com",
                    "https://*.googleusercontent.com",
                    "https://*.gstatic.com",
                    "https://*.doubleclick.net"
                ],

                frameSrc: [
                    "'self'",
                    "https://www.paypal.com",
                    "https://www.sandbox.paypal.com",
                    "https://www.paypalobjects.com",
                    "https://www.google.com"
                ],

                connectSrc: [
                    "'self'",
                    "https://pompea-tours.onrender.com",
                    "https://nominatim.openstreetmap.org",
                    "https://www.paypal.com",
                    "https://www.sandbox.paypal.com",
                    "https://api-m.sandbox.paypal.com",
                    "https://api.paypal.com",
                    "https://api.sandbox.paypal.com",
                    "https://postcollector.paypal.com",
                    "https://browser-intake-us5-datadoghq.com",
                    "https://*.paypal.com",
                    "https://*.paypalobjects.com",
                    "https://*.paypal.cn",
                    "https://objects.paypal.cn",
                    "https://www.google.com",
                    "https://www.gstatic.com",
                    "https://*.doubleclick.net"
                ],

                scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"]
            }
        }
    })
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/recommend-tour', async (req, res) => {
    const { experience, duration, preference } = req.body;

    const prompt = `
You're a smart tour recommender for Pompea Tours in Albania. Based on the user's preferences, recommend ONE of the following tours and give a **concise, clear description (max 2 short sentences)** why it's a great fit:

Here are the tour options:

1. Butrinti & Blue Eye – Best for: Short (5–6h), nature, history, no lunch.
2. Saranda & Gjirokastra – Best for: Full (8–9h), culture, architecture, history.
3. Museum Package – Best for: Standard (6–7h), history, traditions.
4. Permeti – Best for: Full (8–9h), nature, thermal baths, relaxation.
5. Himara – Best for: Full (8h), coast, swimming, relaxation.
6. Gjirokastra + Blue Eye – Best for: Full (8–9h), mixed nature & history.
7. Butrinti & Saranda Highlights – Best for: Standard (7–8h), ruins + beach + views.

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
        language,
        specialRequests,
        pickupLat,
        pickupLng,
        pickupLabel,
        transactionId
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

    // Verify PayPal transaction if selected
    let payerEmail = null;
    let payerName = null;

    if (paymentMethod === 'paypal') {
        if (!transactionId) {
            return res.status(400).json({ error: "Missing PayPal transaction ID." });
        }

        try {
            const paypal = require('@paypal/checkout-server-sdk');
            const { client } = require('./paypal');
            const response = await client().execute(new paypal.orders.OrdersGetRequest(transactionId));
            const order = response.result;

            if (order.status !== 'COMPLETED') {
                return res.status(400).json({ error: "PayPal payment not completed." });
            }

            payerEmail = order.payer.email_address;
            payerName = order.payer.name.given_name + ' ' + order.payer.name.surname;
        } catch (error) {
            console.error("PayPal verification failed:", error);
            return res.status(500).json({ error: "Failed to verify PayPal payment." });
        }
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

        // Find tour details
        const [tourResult] = await connection.query(
            "SELECT * FROM tours WHERE title = ?",
            [tourName.trim()]
        );

        if (tourResult.length === 0) {
            throw new Error("Invalid tour name");
        }

        const tour = tourResult[0];
        const tourId = tour.id;

        // Calculate pricing
        const driverCost = parseFloat(tour.fixed_driver_cost || 0);
        const entryFee = parseFloat(tour.entry_fee_per_person || 0);
        const lunchCost = parseFloat(tour.lunch_cost_per_person || 0);
        const markupPercent = parseFloat(tour.markup_percentage || 0);
        const vatPercent = parseFloat(tour.vat_percentage || 0);
        const taxBuffer = parseFloat(tour.fixed_tax_buffer || 0);

        const baseCost = driverCost + (entryFee * groupSize) + (lunchCost * groupSize);
        const markup = (baseCost * markupPercent) / 100;
        const preVAT = baseCost + markup + taxBuffer;
        const totalVAT = (preVAT * vatPercent) / 100;
        const totalPrice = Math.round(preVAT + totalVAT + (language !== "english" ? 70 : 0));

        // Insert booking
        await connection.query(
            `INSERT INTO bookings (user_id, tour_id, booking_date, num_people, total_price, payment_method, special_requests, language)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                tourId,
                date,
                groupSize,
                totalPrice,
                paymentMethod,
                specialRequests || null,
                language
            ]
        );

        await connection.commit();
        // Email messages
        const adminMsg = `
🧭 New Tour Booking Received!

📌 Booking Summary:
---------------------------
Tour: ${tourName}
Date: ${date}
Number of Adults: ${groupSize}
Language Guide: ${language}
Payment Method: ${paymentMethod}
${paymentMethod === 'paypal' ? `\n🧾 PayPal Transaction:\nID: ${transactionId}\nPayer: ${payerName} (${payerEmail})\n` : ''}
Total Price: €${totalPrice}
---------------------------

📍 Pickup Location:
${pickupLabel || "Not specified"}
${pickupLat && pickupLng ? `Map: https://www.google.com/maps?q=${pickupLat},${pickupLng}` : ''}

👤 Customer Information:
Name: ${name}
Email: ${email}
Phone: ${phone}

📎 Special Requests:
${specialRequests && specialRequests.trim() !== '' ? specialRequests : 'None'}

🕒 Booking Timestamp: ${new Date().toLocaleString()}

Please check the system to confirm availability and prepare for this tour. 
Respond to the customer if any clarification is needed.

— Pompea Tours Booking System
`;
        const userSubject = `Booking Confirmation – ${tourName} with Pompea Tours & Travel`;
        const userMsg = `
Dear ${name},

Thank you for booking with Pompea Tours & Travel. We are happy to welcome you on board and to be part of your exploration of Albania.

Your reservation has been successfully booked.

Booking Details:

Tour: ${tourName}
Date: ${date}
Number of Adults: ${groupSize}
Pick up location: ${pickupLabel || "Not specified"}
Language guide: ${language}
Payment Method: ${paymentMethod.replace("_", " ")}
Total Price: €${totalPrice}

If you have any further questions, need to change the reservation, or have any specific requests, please reply to this email.

We guarantee a response within 24 hours of receiving your email.

See you soon,

Pompea Tours & Travel
Your Journey. Your Story
Instagram | Facebook
`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send admin notification
        await transporter.sendMail({
            from: 'Pompea Tours <noreply@pompeatours.com>',
            to: process.env.ADMIN_EMAIL,
            subject: `New Booking - ${tourName}`,
            text: adminMsg
        });

        // Send user confirmation with embedded logo
        await transporter.sendMail({
            from: 'Pompea Tours <noreply@pompeatours.com>',
            to: email,
            subject: userSubject,
            text: userMsg,
            html: `
    <p>Dear ${name},</p>
    <p>Thank you for booking with <strong>Pompea Tours & Travel</strong>. We are happy to welcome you on board and to be part of your exploration of Albania.</p>
    <p>Your reservation has been successfully booked.</p>

    <h3>Booking Details:</h3>
    <ul>
      <li><strong>Tour:</strong> ${tourName}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Number of Adults:</strong> ${groupSize}</li>
      <li><strong>Pick up location:</strong> ${pickupLabel || "Not specified"}</li>
      <li><strong>Language guide:</strong> ${language}</li>
      <li><strong>Payment Method:</strong> ${paymentMethod.replace("_", " ")}</li>
      <li><strong>Total Price:</strong> €${totalPrice}</li>
    </ul>

    <p>If you have any further questions, need to change the reservation, or have any specific requests, please reply to this email.</p>
    <p>We guarantee a response within 24 hours of receiving your email.</p>

    <p>See you soon,</p>

    <br><br>
    <p style="font-family: sans-serif; font-size: 14px; line-height: 1.5; text-align: center;">
  <strong>Pompea Tours & Travel</strong><br>
  Your Journey. Your Story<br><br>

  <a href="https://www.instagram.com/pompeatours/" target="_blank" style="margin-right: 10px;">
    <img src="cid:instagram-icon" alt="Instagram" width="28" style="vertical-align: middle;">
  </a>
  <a href="https://www.facebook.com/profile.php?id=61576377955556" target="_blank">
    <img src="cid:facebook-icon" alt="Facebook" width="28" style="vertical-align: middle;">
  </a><br><br>

  <img src="cid:pompea-logo" alt="Pompea Tours Logo" width="180" style="margin-top: 10px;">
</p>
  `,
            attachments: [
                {
                    filename: 'logua.jpg',
                    path: path.join(__dirname, '../public/images/logua.jpg'),
                    cid: 'pompea-logo'
                },
                {
                    filename: 'instagram.svg',
                    path: path.join(__dirname, '../public/images/instagram.svg'),
                    cid: 'instagram-icon'
                },
                {
                    filename: 'facebook.svg',
                    path: path.join(__dirname, '../public/images/facebook.svg'),
                    cid: 'facebook-icon'
                }
            ]
        });

        res.json({ message: `✅ Reservation received! Total: €${totalPrice}. Confirmation sent to ${email}.` });
    } catch (error) {
        await connection.rollback();
        console.error("Booking error:", error);
        res.status(500).json({ error: "Could not complete reservation." });
    } finally {
        connection.release();
    }
});

app.post("/estimate", async (req, res) => {
    const { tourName, groupSize, language } = req.body;

    if (!tourName || !groupSize || isNaN(groupSize) || groupSize < 2 || groupSize > 6) {
        return res.status(400).json({ error: "Invalid input." });
    }

    const connection = await pool.getConnection();

    try {
        const [tourResult] = await connection.query(
            "SELECT * FROM tours WHERE title = ?",
            [tourName.trim()]
        );

        if (tourResult.length === 0) {
            return res.status(404).json({ error: "Tour not found." });
        }

        const tour = tourResult[0];

        const driverCost = parseFloat(tour.fixed_driver_cost || 0);
        const entryFee = parseFloat(tour.entry_fee_per_person || 0);
        const lunchCost = parseFloat(tour.lunch_cost_per_person || 0);
        const markupPercent = parseFloat(tour.markup_percentage || 0);
        const vatPercent = parseFloat(tour.vat_percentage || 0);
        const taxBuffer = parseFloat(tour.fixed_tax_buffer || 0);

        const baseCost = driverCost + (entryFee * groupSize) + (lunchCost * groupSize);
        const markup = (baseCost * markupPercent) / 100;
        const preVAT = baseCost + markup + taxBuffer;
        const totalVAT = (preVAT * vatPercent) / 100;
        const totalPrice = Math.round(preVAT + totalVAT + (language !== "english" ? 70 : 0));

        res.json({ estimatedPrice: totalPrice });
    } catch (err) {
        console.error("Estimate error:", err);
        res.status(500).json({ error: "Server error calculating price." });
    } finally {
        connection.release();
    }
});

const { client, OrdersCreateRequest } = require('./paypal');

app.post("/create-order", async (req, res) => {
    const { tourName, groupSize, language } = req.body;


    const connection = await pool.getConnection();
    try {
        const [tourResult] = await connection.query("SELECT * FROM tours WHERE title = ?", [tourName.trim()]);
        if (tourResult.length === 0) {
            return res.status(400).json({ error: "Tour not found" });
        }

        const tour = tourResult[0];

        const driverCost = parseFloat(tour.fixed_driver_cost || 0);
        const entryFee = parseFloat(tour.entry_fee_per_person || 0);
        const lunchCost = parseFloat(tour.lunch_cost_per_person || 0);
        const markupPercent = parseFloat(tour.markup_percentage || 0);
        const vatPercent = parseFloat(tour.vat_percentage || 0);
        const taxBuffer = parseFloat(tour.fixed_tax_buffer || 0);

        const baseCost = driverCost + (entryFee * groupSize) + (lunchCost * groupSize);
        const markup = (baseCost * markupPercent) / 100;
        const preVAT = baseCost + markup + taxBuffer;
        const totalVAT = (preVAT * vatPercent) / 100;
        const totalPrice = Math.round(preVAT + totalVAT + (language !== "english" ? 70 : 0));

        const request = new OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            application_context: {
                shipping_preference: "NO_SHIPPING"
            },
            purchase_units: [{
                amount: {
                    currency_code: "EUR",
                    value: totalPrice.toString()
                }
            }]
        });

        const order = await client().execute(request);
        res.json({ id: order.result.id });
    } catch (err) {
        console.error("PayPal Order Error:", err);
        res.status(500).json({ error: "Payment setup failed." });
    } finally {
        connection.release();
    }
});

app.get("/booked-dates", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const [results] = await connection.query(
            "SELECT DISTINCT booking_date FROM bookings"
        );

        const bookedDates = results.map(row => row.booking_date.toISOString().split("T")[0]);
        res.json({ bookedDates });
    } catch (err) {
        console.error("Error fetching booked dates:", err);
        res.status(500).json({ error: "Could not retrieve booked dates." });
    } finally {
        connection.release();
    }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '..')));

// Catch-all to return index.html for unknown routes (optional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Pompea AI backend running on port ${PORT}`));