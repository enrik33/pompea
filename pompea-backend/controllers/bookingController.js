import stripe from "../config/stripe.js";
import { createBooking, updateBookingStatus } from "../models/bookingModel.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const { userName, email, tourId, tourName, totalPrice } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: tourName },
                        unit_amount: totalPrice * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: "http://localhost:3000/payment-success",
            cancel_url: "http://localhost:3000/payment-cancel",
        });

        createBooking(userName, email, tourId, tourName, totalPrice, session.id, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ id: session.id });
        });
    } catch (error) {
        console.error("Stripe error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
};

export const verifyPayment = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        updateBookingStatus(session.id, "paid", (err) => {
            if (err) console.error("Database update error:", err);
        });
    }

    res.json({ received: true });
};