document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tourName = urlParams.get("tour");
    if (tourName) {
        document.getElementById("tourName").value = decodeURIComponent(tourName);
    }

    const form = document.getElementById("booking-form");
    const confirmation = document.getElementById("confirmation-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

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
    });
});