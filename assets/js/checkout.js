document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("booking-form");
    const confirmation = document.getElementById("confirmation-message");
    const submitBtn = form.querySelector("button[type='submit']");

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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^\+?\d{8,15}$/;
        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        const validPayments = ["paypal", "bank_transfer", "cash"];

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const groupSize = parseInt(form.groupSize.value);
        const selectedDate = form.date.value;
        const paymentMethod = form.paymentMethod.value;
        const specialRequests = form.specialRequests.value.trim();

        if (!nameRegex.test(name)) {
            return alert("Please enter a valid name (letters and spaces only).");
        }

        if (!emailRegex.test(email)) {
            return alert("Please enter a valid email address.");
        }

        if (!phoneRegex.test(phone)) {
            return alert("Please enter a valid phone number.");
        }

        if (!selectedDate || selectedDate < today || selectedDate > maxDateFormatted) {
            return alert("Please select a valid date within the next year.");
        }

        if (groupSize < 2 || groupSize > 6) {
            return alert("Group size must be between 2 and 6.");
        }

        if (!validPayments.includes(paymentMethod)) {
            return alert("Please select a valid payment method.");
        }

        if (specialRequests.length > 500) {
            return alert("Special requests must be under 500 characters.");
        }

        if (!language) {
            return alert("Please select a language.");
        }

        const language = form.querySelector("#language").value;

        const data = {
            tourName,
            date: selectedDate,
            groupSize,
            name,
            email,
            phone,
            paymentMethod,
            language,
            specialRequests
        };

        // Disable button to prevent duplicate submission
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        try {
            form.querySelector("button[type='submit']").disabled = true;
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
