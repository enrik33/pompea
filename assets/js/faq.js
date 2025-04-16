document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const faqContainer = document.getElementById("faq-container");

    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    searchInput.setAttribute("placeholder", "Search FAQs...");
    searchInput.classList.add("faq-search");
    faqContainer.parentNode.insertBefore(searchInput, faqContainer);

    const faqs = [
        {
            question: "Who is Pompea Tours & Travel?",
            answer: "Pompea Tours & Travel offers tailor-made private tours designed to showcase the best of Albania. Their experienced local guides lead you on unforgettable journeys through the country's historic landmarks and hidden gems, providing an immersive cultural experience.",
            category: "booking"
        },
        {
            question: "What types of tours do you offer?",
            answer: "We offer various tours that cater to different interests: Saranda Local Tours, Saranda & Surrounding Areas, Gjirokastra Tours, Himara Tours, and Thermal Baths & Town Exploration in Permeti.",
            category: "booking"
        },
        {
            question: "What is included in the tours?",
            answer: "Each tour includes a guided exploration of key attractions, with lunch provided in some packages. Transport from your accommodation is included.",
            category: "tour"
        },
        {
            question: "Can I customize my tour?",
            answer: "Yes, we offer the flexibility to tailor your trip. Contact us for a personalized itinerary. <a href='../services/custom-tour.html'>Design your own tour here.</a>",
            category: "tour"
        },
        {
            question: "What is the 'Butrinti & Saranda Highlights' tour?",
            answer: "A full-day tour to Butrint (UNESCO), lunch in Ksamil, views from Lekuresi Castle, and a visit to a historic city basilica.",
            category: "tour"
        },
        {
            question: "What are the transfer services?",
            answer: "We offer private transfers between Saranda and Tirana Airport, as well as to other cities like Berat and Gjirokastra.",
            category: "transport"
        },
        {
            question: "Do you assist with flight bookings?",
            answer: "We don’t book flights directly, but we provide helpful resources and booking links.",
            category: "planning"
        },
        {
            question: "Can you help with accommodation?",
            answer: "Yes, we assist with booking curated accommodations in Saranda and Ksamil with trusted local hosts.",
            category: "planning"
        },
        {
            question: "What is the best time to visit Albania?",
            answer: "From April to October — the weather is ideal for outdoor tours, beaches, and cultural sites.",
            category: "planning"
        },
        {
            question: "How can I leave feedback?",
            answer: "You can leave a review on Google, TripAdvisor, or social media, or contact us directly by email.",
            category: "feedback"
        },
        {
            question: "Are there tours for special interests?",
            answer: "Yes! We can design tours around food, adventure, photography, or any other interests you have.",
            category: "booking"
        },
        {
            question: "What happens if I need to cancel or change my booking?",
            answer: "Full refund if cancelled 48h+ before, 50% refund between 24–48h, no refund under 24h or for no-shows.",
            category: "payment"
        },
        {
            question: "How do I book a tour?",
            answer: "Use our website or email us. We’ll confirm your preferred tour and arrange everything else.",
            category: "booking"
        },
        {
            question: "What is the 'Two Cities Tour: Saranda & Gjirokastra'?",
            answer: "Explore Saranda’s basilica, Butrint ruins, Gjirokastra Castle, the House of Zekateve, and Lekuresi Castle — all in one day.",
            category: "tour"
        },
        {
            question: "What is the 'Gjirokastra + Blue Eye' tour?",
            answer: "Visit the Blue Eye spring, lunch in Gjirokastra’s old town, and explore the castle and House of Zekateve.",
            category: "tour"
        },
        {
            question: "Do the tours include meals?",
            answer: "Some tours include lunch, especially full-day packages like Butrinti & Saranda Highlights.",
            category: "tour"
        },
        {
            question: "Can I swim during the tours?",
            answer: "Yes, many tours include time to swim in places like Ksamil or the Blue Eye.",
            category: "tour"
        },
        {
            question: "What is the 'Permeti: Thermal Baths & Town Exploration' tour?",
            answer: "A full-day experience with the Benje Thermal Baths, Cold Water stop, local lunch, and Kelcyra Gorge.",
            category: "tour"
        },
        {
            question: "How long are the tours?",
            answer: "Short tours last 4–6h. Full-day tours can be up to 9h. See each tour page for details.",
            category: "tour"
        },
        {
            question: "What should I bring for the tours?",
            answer: "Comfortable shoes, sun protection, camera, water, and swimwear if applicable.",
            category: "planning"
        },
        {
            question: "Are your tours suitable for families with children?",
            answer: "Yes! Most tours are family-friendly. Let us know in advance so we can adjust as needed.",
            category: "tour"
        },
        {
            question: "Are there any discounts for large groups or extended bookings?",
            answer: "Yes — contact us for a personalized quote for groups or multi-day plans.",
            category: "payment"
        },
        {
            question: "Is it possible to combine different tours in one booking?",
            answer: "Yes, you can mix and match destinations for a custom experience. We’ll help you plan the route.",
            category: "tour"
        },
        {
            question: "Can I book a private tour for a special occasion?",
            answer: "Absolutely — we arrange tours for birthdays, anniversaries, proposals, and more.",
            category: "tour"
        },
        {
            question: "What makes your tours different from others?",
            answer: "We offer small-group private tours led by passionate local guides who share authentic stories and culture.",
            category: "booking"
        },
        {
            question: "Do you offer transportation for guests with special needs?",
            answer: "Yes, we can arrange vehicles with accessibility options. Let us know your needs in advance.",
            category: "transport"
        },
        {
            question: "How far in advance should I book a tour?",
            answer: "We recommend a few days in advance, especially during April–October. Last-minute bookings may still be possible.",
            category: "booking"
        },
        {
            question: "What is the cancellation policy for your tours?",
            answer: "Full refund 48h+, 50% refund 24–48h, no refund <24h or for no-shows. Refunds processed to original payment method.",
            category: "payment"
        },
        {
            question: "Are pets allowed on the tours?",
            answer: "In some cases, yes — but please check with us in advance as not all destinations are pet-friendly.",
            category: "planning"
        },
        {
            question: "Do I need to speak Albanian to enjoy the tours?",
            answer: "No — our guides speak English and often Italian, French, or German too.",
            category: "planning"
        },
        {
            question: "How are the tours conducted?",
            answer: "All tours are private or small-group, with a local guide, and tailored to your pace and interests.",
            category: "tour"
        },
        {
            question: "Is transportation provided for all tours?",
            answer: "Yes — pick-up from your hotel and full transportation throughout the day are included.",
            category: "transport"
        },
        {
            question: "What is the 'Saranda & the Surrounding Area' basic tour?",
            answer: "A shorter tour featuring Butrint and the Blue Eye, with time for lunch and sightseeing.",
            category: "tour"
        },
        {
            question: "What is the 'Berat: Town of a Thousand Windows' tour?",
            answer: "A scenic journey to UNESCO-listed Berat, exploring its castle, old town, and enjoying a local lunch.",
            category: "tour"
        },
        {
            question: "What types of meals can I expect during the tours?",
            answer: "Traditional Albanian meals with local ingredients: grilled meats, seafood, vegetables, cheeses, and bread.",
            category: "tour"
        },
        {
            question: "Can I bring my own snacks or drinks on the tour?",
            answer: "Yes — you're welcome to bring personal snacks or water for the journey.",
            category: "tour"
        },
        {
            question: "What is the 'Himara: Coastal Scenery & Relaxation' tour?",
            answer: "A relaxing trip to Porto Palermo Castle and Himara beach, ending with a seaside dinner.",
            category: "tour"
        },
        {
            question: "Are there any opportunities to buy local souvenirs?",
            answer: "Yes, many stops include access to artisan markets or shops with local crafts and goods.",
            category: "planning"
        },
        {
            question: "Can I pay for the tours in advance?",
            answer: "Yes — we accept advance payment via PayPal, bank transfer, or cash on the day of the tour.",
            category: "payment"
        },
        {
            question: "Are the tours available in different languages?",
            answer: "Yes — we offer tours in English, Italian, French, and German based on guide availability.",
            category: "tour"
        },
        {
            question: "What are the benefits of booking a private tour over a group tour?",
            answer: "Private tours are more flexible, personalized, and comfortable — perfect for small groups.",
            category: "tour"
        },
        {
            question: "Are the tours physically demanding?",
            answer: "Most tours involve walking, but the pace is moderate. Let us know if you need adjustments.",
            category: "tour"
        },
        {
            question: "What kind of vehicles are used for transportation?",
            answer: "Comfortable air-conditioned cars or minivans, depending on your group size.",
            category: "transport"
        },
        {
            question: "Is there a minimum or maximum number of people required for the tours?",
            answer: "Minimum 2 people, maximum 6 per tour. Contact us if your group is larger.",
            category: "transport"
        },
        {
            question: "How do I make a booking?",
            answer: "Visit the tour page and book online, or email us directly with your travel dates.",
            category: "booking"
        },
        {
            question: "Can I visit multiple destinations in one day?",
            answer: "Yes, we can design a route that includes multiple stops depending on timing and location.",
            category: "planning"
        },
        {
            question: "What should I do if I need help during the tour?",
            answer: "Your guide is there to help. You can also contact our office via phone or WhatsApp anytime.",
            category: "planning"
        },
        {
            question: "Are there any age restrictions for the tours?",
            answer: "No — our tours are suitable for all ages. We adjust for kids and older adults as needed.",
            category: "planning"
        },
        {
            question: "Can I take photos during the tours?",
            answer: "Absolutely — and our guides are happy to help you find the best photo spots!",
            category: "planning"
        }
    ];

    function createFAQItem(faq) {
        const item = document.createElement("div");
        item.className = `faq-item ${faq.category}`;

        const question = document.createElement("button");
        question.className = "faq-question";
        question.innerHTML = `<span class="toggle-icon">+</span> ${faq.question}`;

        const answer = document.createElement("div");
        answer.className = "faq-answer";
        answer.innerHTML = faq.answer;

        question.addEventListener("click", () => {
            answer.classList.toggle("open");
            const icon = question.querySelector(".toggle-icon");
            icon.textContent = answer.classList.contains("open") ? "−" : "+";
        });

        item.appendChild(question);
        item.appendChild(answer);
        faqContainer.appendChild(item);
    }

    faqs.forEach(createFAQItem);

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            document.querySelector(".filter-btn.active")?.classList.remove("active");
            button.classList.add("active");

            const selected = button.getAttribute("data-category");
            const allFAQs = document.querySelectorAll(".faq-item");

            allFAQs.forEach(faq => {
                if (selected === "all" || faq.classList.contains(selected)) {
                    faq.style.display = "block";
                } else {
                    faq.style.display = "none";
                }
            });
        });
    });

    // 🔎 Simple search logic
    searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase();
        const allFAQs = document.querySelectorAll(".faq-item");

        allFAQs.forEach(faq => {
            const text = faq.textContent.toLowerCase();
            faq.style.display = text.includes(term) ? "block" : "none";
        });
    });

    //     // 👋 Still have questions footer
    //     const moreHelp = document.createElement("div");
    //     moreHelp.className = "faq-footer";
    //     moreHelp.innerHTML = `
    //     <h3>Still have questions?</h3>
    //     <p>Contact us at <a href="mailto:ec5745@rit.edu">ec5745@rit.edu</a> or <a href="../index.html#tours">book your tour here</a>.</p>
    //   `;
    //     faqContainer.parentNode.appendChild(moreHelp);
});
