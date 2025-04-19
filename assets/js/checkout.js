document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("booking-form");
    const confirmation = document.getElementById("confirmation-message");
    const submitBtn = form.querySelector("button[type='submit']");
    const pricePreview = document.getElementById("price-preview");

    const today = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    const maxDateFormatted = maxDate.toISOString().split("T")[0];

    const dateInput = document.getElementById("date");
    dateInput.setAttribute("min", today);
    dateInput.setAttribute("max", maxDateFormatted);

    const urlParams = new URLSearchParams(window.location.search);
    const tourName = urlParams.get("tour");
    if (tourName) {
        document.getElementById("tourName").value = decodeURIComponent(tourName);
    }

    async function fetchTourPriceEstimate() {
        const groupSize = parseInt(form.querySelector("#groupSize").value);
        const language = form.querySelector("#language").value;
        if (!tourName || isNaN(groupSize) || groupSize < 2 || groupSize > 6) return;

        try {
            const res = await fetch("http://localhost:4000/estimate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tourName: decodeURIComponent(tourName),
                    groupSize,
                    language
                })
            });
            const result = await res.json();
            if (res.ok && result.estimatedPrice) {
                pricePreview.textContent = `Estimated Total: €${result.estimatedPrice}`;
            } else {
                pricePreview.textContent = "";
            }
        } catch (err) {
            console.error("Error fetching estimate:", err);
            pricePreview.textContent = "";
        }
    }

    form.querySelector("#groupSize").addEventListener("input", fetchTourPriceEstimate);
    form.querySelector("#language").addEventListener("change", fetchTourPriceEstimate);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^\+?\d{8,15}$/;
        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        const validPayments = ["paypal", "bank_transfer", "cash"];

        const name = form.querySelector("#name").value.trim();
        const email = form.querySelector("#email").value.trim();
        const phone = form.querySelector("#phone").value.trim();
        const groupSize = parseInt(form.querySelector("#groupSize").value);
        const selectedDate = form.querySelector("#date").value;
        const paymentMethod = form.querySelector("#paymentMethod").value;
        const language = form.querySelector("#language").value;
        const specialRequests = form.querySelector("#specialRequests").value.trim();

        if (!nameRegex.test(name)) return alert("Please enter a valid name (letters and spaces only).");
        if (!emailRegex.test(email)) return alert("Please enter a valid email address.");
        if (!phoneRegex.test(phone)) return alert("Please enter a valid phone number.");
        if (!selectedDate || selectedDate < today || selectedDate > maxDateFormatted) return alert("Please select a valid date within the next year.");
        if (groupSize < 2 || groupSize > 6) return alert("Group size must be between 2 and 6.");
        if (!validPayments.includes(paymentMethod)) return alert("Please select a valid payment method.");
        if (specialRequests.length > 500) return alert("Special requests must be under 500 characters.");

        const data = {
            tourName: decodeURIComponent(tourName),
            date: selectedDate,
            groupSize,
            name,
            email,
            phone,
            paymentMethod,
            language,
            specialRequests
        };

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        try {
            const res = await fetch("http://localhost:4000/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                form.reset();
                form.classList.add("hidden");
                confirmation.classList.remove("hidden");
                confirmation.textContent = result.message;
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                alert(result.error || "Something went wrong. Try again later.");
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("Unable to submit. Check your connection or try again later.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Confirm Reservation";
        }
    });
});