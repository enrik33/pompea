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
    const maxDate = new Date(new Date().getFullYear(), 9, 30); // October = month 9 (0-indexed)
    const maxDateFormatted = maxDate.toISOString().split("T")[0];

    const dateInput = document.getElementById("date");
    dateInput.setAttribute("min", today);
    dateInput.setAttribute("max", maxDateFormatted);

    const urlParams = new URLSearchParams(window.location.search);
    const tourName = urlParams.get("tour");
    if (tourName) {
        document.getElementById("tourName").value = decodeURIComponent(tourName);
    }

    const honeypot = form.querySelector("#website").value;
    if (honeypot !== "") {
        alert("Spam detected. Submission blocked.");
        return;
    }

    // Regex patterns
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+?\d{8,15}$/;

    // Field references
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const groupSizeInput = document.getElementById("groupSize");

    [nameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener("paste", (e) => {
            const pasted = e.clipboardData.getData("text");
            if (!input.checkValidity() || pasted.length > input.maxLength) {
                e.preventDefault();
            }
        });
    });

    // Real-time validation on blur
    nameInput.addEventListener("blur", () =>
        validateField(nameInput, nameRegex, "Name must be 2–50 letters only.")
    );
    emailInput.addEventListener("blur", () =>
        validateField(emailInput, emailRegex, "Enter a valid email address.")
    );
    phoneInput.addEventListener("blur", () =>
        validateField(phoneInput, phoneRegex, "Enter a valid phone number (8–15 digits).")
    );
    groupSizeInput.addEventListener("blur", () => validateGroupSize(groupSizeInput));
    dateInput.addEventListener("blur", () => validateDateField(dateInput, today, maxDateFormatted));

    function validateField(input, regex, errorMessage) {
        const value = input.value.trim();
        const label = input.closest(".form-group").querySelector("label");


        if (!regex.test(value)) {
            input.classList.add("error");
            label.classList.add("error-label");
            input.setCustomValidity(errorMessage);
        } else {
            input.classList.remove("error");
            label.classList.remove("error-label");
            input.setCustomValidity(""); // Reset error
        }
        input.reportValidity();
    }

    function validateDateField(input, minDate, maxDate) {
        const value = input.value;
        const label = input.closest(".form-group").querySelector("label");

        if (!value || value < minDate || value > maxDate) {
            input.classList.add("error");
            label.classList.add("error-label");
            input.setCustomValidity("Choose a valid date within the next year.");
        } else {
            input.classList.remove("error");
            label.classList.remove("error-label");
            input.setCustomValidity("");
        }
        input.reportValidity();
    }

    function validateGroupSize(input) {
        const value = parseInt(input.value);
        const label = input.closest(".form-group").querySelector("label");

        if (isNaN(value) || value < 2 || value > 6) {
            input.classList.add("error");
            label.classList.add("error-label");
            input.setCustomValidity("Group size must be between 2 and 6.");
        } else {
            input.classList.remove("error");
            label.classList.remove("error-label");
            input.setCustomValidity("");
        }
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

    function debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
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

    const debouncedFetchPrice = debounce(fetchTourPriceEstimate, 300);
    form.querySelector("#groupSize").addEventListener("input", debouncedFetchPrice);
    form.querySelector("#language").addEventListener("change", debouncedFetchPrice);

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