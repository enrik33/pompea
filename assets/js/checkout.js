document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("booking-form");
    const confirmation = document.getElementById("confirmation-message");
    const submitBtn = form.querySelector("button[type='submit']");
    const pricePreview = document.getElementById("price-preview");

    const paypalContainer = document.getElementById("paypal-button-container");
    const cashBtn = document.getElementById("cash-button");
    const bankInfo = document.getElementById("bank-instructions");
    const API_BASE_URL =
        location.hostname === "localhost" || location.hostname === "127.0.0.1"
            ? "http://localhost:4000"
            : "https://pompea-backend.onrender.com";

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

    function updatePaymentVisibility() {
        const payment = document.getElementById("paymentMethod").value;

        paypalContainer.classList.add("hidden");
        cashBtn.classList.add("hidden");
        bankInfo.classList.add("hidden");

        if (payment === "paypal") {
            paypalContainer.classList.remove("hidden");
        } else if (payment === "cash") {
            cashBtn.classList.remove("hidden");
        } else if (payment === "bank_transfer") {
            bankInfo.innerHTML = `
                <div class="bank-message">
                    Please transfer your total amount to:<br>
                    <strong>IBAN:</strong> AL01234567890123456789012345<br>
                    <strong>SWIFT:</strong> ALBXXXX<br>
                    Include your full name as the payment reference.
                </div>`;
            bankInfo.classList.remove("hidden");
        }
    }

    async function fetchTourPriceEstimate() {
        const groupSize = parseInt(form.querySelector("#groupSize").value);
        const language = form.querySelector("#language").value;
        if (!tourName || isNaN(groupSize) || groupSize < 2 || groupSize > 6) return;

        try {
            const res = await fetch(`${API_BASE_URL}/estimate`, {
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
                const perPerson = Math.round(result.estimatedPrice / groupSize);
                pricePreview.innerHTML = `Estimated Total: €${result.estimatedPrice}<span>€${perPerson} per person</span>`;
                pricePreview.classList.add("show");
                pricePreview.classList.remove("hidden");
            } else {
                pricePreview.textContent = "";
                pricePreview.classList.remove("show");
            }
        } catch (err) {
            console.error("Error fetching estimate:", err);
            pricePreview.textContent = "";
        }
    }

    form.querySelector("#groupSize").addEventListener("input", fetchTourPriceEstimate);
    form.querySelector("#language").addEventListener("change", fetchTourPriceEstimate);

    function getFormData() {
        return {
            tourName: decodeURIComponent(tourName),
            date: form.querySelector("#date").value,
            groupSize: parseInt(form.querySelector("#groupSize").value),
            name: form.querySelector("#name").value.trim(),
            email: form.querySelector("#email").value.trim(),
            phone: form.querySelector("#phone").value.trim(),
            paymentMethod: "paypal", // always "paypal" for this case
            language: form.querySelector("#language").value,
            specialRequests: form.querySelector("#specialRequests").value.trim()
        };
    }

    // PayPal button always renders
    if (typeof paypal !== "undefined") {
        paypal.Buttons({
            createOrder: async () => {
                const groupSize = parseInt(document.querySelector("#groupSize").value);
                const language = document.querySelector("#language").value;
                const res = await fetch(`${API_BASE_URL}/create-order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tourName: decodeURIComponent(tourName),
                        groupSize,
                        language
                    })
                });

                const dataRes = await res.json();
                return dataRes.id;
            },
            onApprove: async (data, actions) => {
                try {
                    const details = await actions.order.capture();
                    alert("✅ Payment completed by " + details.payer.name.given_name);

                    const bookingData = getFormData();

                    const res = await fetch(`${API_BASE_URL}/book`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(bookingData)
                    });

                    const result = await res.json();

                    if (res.ok) {
                        form.reset();
                        form.classList.add("hidden");
                        confirmation.classList.remove("hidden");
                        confirmation.textContent = result.message;
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                        alert(result.error || "Payment was successful, but booking failed.");
                    }

                } catch (err) {
                    console.error("Booking error after PayPal:", err);
                    alert("Something went wrong after payment. Please contact support.");
                }
            },
            onError: (err) => {
                console.error("PayPal Error:", err);
                alert("PayPal transaction failed.");
            }
        }).render("#paypal-button-container");
    }

    document.getElementById("paymentMethod").addEventListener("change", updatePaymentVisibility);

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

        // ⛔ Skip submitting if PayPal is selected — use the PayPal button instead
        if (paymentMethod === "paypal") {
            alert("Please complete your payment using the PayPal button below.");
            return;
        }

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
            const res = await fetch(`${API_BASE_URL}/book`, {
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