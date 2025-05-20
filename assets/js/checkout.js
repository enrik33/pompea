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

    let map, marker;
    const mapModal = document.getElementById("mapModal");
    const openMapBtn = document.getElementById("openMapBtn");
    const confirmLocationBtn = document.getElementById("confirmLocationBtn");
    const pickupSummary = document.getElementById("pickupSummary");
    const pickupLatInput = document.getElementById("pickupLat");
    const pickupLngInput = document.getElementById("pickupLng");

    openMapBtn.addEventListener("click", () => {
        mapModal.classList.remove("hidden");

        if (!map) {
            map = L.map('map').setView([39.870, 20.005], 13); // Fallback center (Saranda)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                if (marker) {
                    marker.setLatLng([lat, lng]);
                } else {
                    marker = L.marker([lat, lng]).addTo(map);
                }

                pickupLatInput.value = lat.toFixed(6);
                pickupLngInput.value = lng.toFixed(6);
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        const locationName = data.display_name || "Unknown location";
                        pickupSummary.innerHTML = `📍 <strong>${locationName}</strong><br>(${lat.toFixed(6)}, ${lng.toFixed(6)})`;
                        document.getElementById("pickupLabel").value = locationName;

                        // Optionally attach popup to the marker
                        marker.bindPopup(locationName).openPopup();
                    })
                    .catch(() => {
                        pickupSummary.innerHTML = `📍 Selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    });

            });

            // Try to locate user's current position
            map.locate({ setView: true, maxZoom: 16 });

            map.on('locationfound', (e) => {
                const { lat, lng } = e.latlng;
                if (!marker) {
                    marker = L.marker([lat, lng]).addTo(map);
                } else {
                    marker.setLatLng([lat, lng]);
                }

                pickupLatInput.value = lat.toFixed(6);
                pickupLngInput.value = lng.toFixed(6);
                pickupSummary.innerText = `📍 Detected location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            });

            map.on('locationerror', () => {
                console.warn("⚠️ Could not get user's location — using default center.");
            });
        } else {
            map.invalidateSize(); // Ensures map resizes correctly if reopened
        }
    });

    confirmLocationBtn.addEventListener("click", () => {
        if (!pickupLatInput.value || !pickupLngInput.value) {
            alert("Please select a location on the map first.");
            return;
        }
        mapModal.classList.add("hidden");
    });

    let blockedDates = [];

    const dateInput = document.getElementById("date");
    dateInput.disabled = true;

    async function fetchBlockedDatesAndInit() {
        try {
            const res = await fetch(`${API_BASE_URL}/booked-dates`);
            const result = await res.json();
            blockedDates = result.bookedDates || [];

            flatpickr("#date", {
                dateFormat: "Y-m-d",
                minDate: today,
                maxDate: maxDateFormatted,
                disable: blockedDates,
                disableMobile: true,
                onDayCreate: function (dObj, dStr, fp, dayElem) {
                    const dateObj = dayElem.dateObj;
                    const yyyy = dateObj.getFullYear();
                    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const dd = String(dateObj.getDate()).padStart(2, '0');
                    const formatted = `${yyyy}-${mm}-${dd}`;

                    const dot = document.createElement("span");
                    dot.classList.add("availability-dot");

                    if (blockedDates.includes(formatted)) {
                        dot.classList.add("booked"); // red
                    } else {
                        dot.classList.add("available"); // green
                    }

                    dayElem.appendChild(dot);
                }, onReady: () => {
                    dateInput.disabled = false;
                    document.getElementById("date").classList.remove("hidden-native-picker");
                },
                onChange: (selectedDates, dateStr, instance) => {
                    if (blockedDates.includes(dateStr)) {
                        alert("❌ That date is already booked. Please select another.");
                        instance.clear();
                    }
                },
                onClose: (selectedDates, dateStr, instance) => {
                    if (blockedDates.includes(dateStr)) {
                        alert("❌ That date is already booked.");
                        instance.clear();
                    }
                }
            });
        } catch (err) {
            console.error("❌ Failed to load booked dates:", err);
        }
    }

    fetchBlockedDatesAndInit();

    function updatePaymentVisibility() {
        const payment = document.getElementById("paymentMethod").value;

        paypalContainer.classList.add("hidden");
        cashBtn.classList.add("hidden");
        bankInfo.classList.add("hidden");

        if (payment === "paypal") {
            paypalContainer.classList.remove("hidden");
            paypalContainer.innerHTML = ""; // Clear old PayPal button
            renderPayPalButton();           // Render fresh with current data
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
            pricePreview.innerHTML = `<em>Loading price...</em>`;
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

    const reRenderPayPal = debounce(() => {
        const container = document.getElementById("paypal-button-container");
        container.innerHTML = "";
        renderPayPalButton();
    }, 300);

    form.querySelector("#groupSize").addEventListener("input", reRenderPayPal);
    form.querySelector("#language").addEventListener("change", reRenderPayPal);


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
            specialRequests: form.querySelector("#specialRequests").value.trim(),
            pickupLat: document.getElementById("pickupLat").value,
            pickupLng: document.getElementById("pickupLng").value,
            pickupLabel: document.getElementById("pickupLabel").value,
        };
    }

    // PayPal button always renders
    function renderPayPalButton() {
        if (typeof paypal === "undefined") return;

        // Check if all required fields are valid
        const groupSize = parseInt(document.querySelector("#groupSize").value);
        const language = document.querySelector("#language").value;
        const name = document.querySelector("#name").value.trim();
        const email = document.querySelector("#email").value.trim();
        const phone = document.querySelector("#phone").value.trim();
        const date = document.querySelector("#date").value;

        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^\+?\d{8,15}$/;

        const isValid =
            nameRegex.test(name) &&
            emailRegex.test(email) &&
            phoneRegex.test(phone) &&
            date &&
            groupSize >= 2 &&
            groupSize <= 6 &&
            language;

        if (!isValid) {
            console.warn("Not rendering PayPal button — form is incomplete or invalid.");
            return;
        }

        paypal.Buttons({
            createOrder: async () => {
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

                    if (details.status !== "COMPLETED") {
                        alert("❌ Payment could not be verified. Please try again or use another method.");
                        return;
                    }

                    alert("✅ Payment completed by " + details.payer.name.given_name);

                    const bookingData = getFormData();
                    bookingData.transactionId = details.id;

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

        const honeypot = form.querySelector("#website").value;
        if (honeypot !== "") {
            alert("Spam detected. Submission blocked.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^\+?\d{8,15}$/;
        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        const validPayments = ["paypal", "bank_transfer", "cash"];

        const name = form.querySelector("#name").value.trim();
        const email = form.querySelector("#email").value.trim();
        const phone = form.querySelector("#phone").value.trim();
        const groupSize = parseInt(form.querySelector("#groupSize").value);
        const selectedDate = form.querySelector("#date").value;
        if (blockedDates.includes(selectedDate)) {
            alert("That date is already fully booked. Please choose another.");
            return;
        }
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

        // Skip submitting if PayPal is selected — use the PayPal button instead
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
            specialRequests,
            pickupLat: document.getElementById("pickupLat").value,
            pickupLng: document.getElementById("pickupLng").value,
            pickupLabel: document.getElementById("pickupLabel").value
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