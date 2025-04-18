document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").setAttribute("min", today);

    const urlParams = new URLSearchParams(window.location.search);
    const tourName = urlParams.get("tour");
    if (tourName) {
        document.getElementById("tourName").value = decodeURIComponent(tourName);
    }

    const form = document.getElementById("booking-form");
    const confirmation = document.getElementById("confirmation-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^\+?\d{8,15}$/;
        const nameRegex = /^[A-Za-z\s]{2,50}$/;

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const groupSize = parseInt(form.groupSize.value);

        if (!nameRegex.test(name)) {
            alert("Please enter a valid name (letters and spaces only).");
            return;
        }

        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!phoneRegex.test(phone)) {
            alert("Please enter a valid phone number.");
            return;
        }

        if (groupSize < 2 || groupSize > 6) {
            alert("Group size must be between 2 and 6.");
            return;
        }

        if (form.paymentMethod.value === "") {
            alert("Please select a payment method.");
            return;
        }
        if (form.date.value === "") {
            alert("Please select a date.");
            return;
        }

        if (form.specialRequests.value.length > 500) {
            alert("Special requests must be under 500 characters.");
            return;
        }

        const data = {
            tourName: form.tourName.value,
            date: form.date.value,
            groupSize: parseInt(form.groupSize.value),
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            paymentMethod: form.paymentMethod.value,
            specialRequests: form.specialRequests.value
        };

        try {
            const res = await fetch("http://localhost:4000/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                form.classList.add("hidden");
                confirmation.classList.remove("hidden");
                confirmation.textContent = result.message;
            } else {
                alert(result.error || "Something went wrong. Try again later.");
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("Unable to submit. Check your connection or try again later.");
        }

        if (res.ok) {
            form.reset();
            form.classList.add("hidden");
            confirmation.classList.remove("hidden");
            confirmation.textContent = result.message;
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
});