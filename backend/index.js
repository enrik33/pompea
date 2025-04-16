const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Pompea AI backend running on port ${PORT}`));
