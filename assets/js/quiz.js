window.onload = function () {
    const findMyTourButton = document.getElementById("findMyTourButton");
    const aiLoading = document.getElementById("ai-loading");
    const aiModal = document.getElementById("ai-result-modal");
    const aiText = document.getElementById("ai-recommendation-text");
    const viewTourBtn = document.getElementById("view-tour-btn");
    const retakeBtn = document.getElementById("retake-quiz-btn");

    // Step-by-step quiz logic
    let currentStep = 0;
    const steps = document.querySelectorAll(".question-step");
    const nextBtns = document.querySelectorAll(".next-question");
    const prevBtns = document.querySelectorAll(".prev-question");
    const submitBtn = document.getElementById("findMyTourButton");
    const API_BASE_URL =
        location.hostname === "localhost" || location.hostname === "127.0.0.1"
            ? "http://localhost:4000"
            : "https://pompea-backend.onrender.com";


    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle("active-step", i === index);
        });

        // Enable/disable prev/next buttons dynamically
        prevBtns.forEach(btn => btn.disabled = index === 0);
        nextBtns.forEach(btn => btn.style.display = index === steps.length - 1 ? "none" : "inline-block");
        submitBtn.style.display = index === steps.length - 1 ? "inline-block" : "none";
    }

    nextBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    showStep(currentStep); // Initial call

    let tourMap = {
        "Butrinti & Blue Eye": "../tours/Butrinti&Blue_Eye_tour.html",
        "Saranda & Gjirokastra": "../tours/Saranda&Gjirokastra_tour.html",
        "Museum Package": "../tours/Museum.html",
        "Permeti": "../tours/Permeti_tour.html",
        "Himara": "../tours/Himara_tour.html",
        "Gjirokastra + Blue Eye": "../tours/Gjirokastra_Blue_Eye.html",
        "Butrinti & Saranda Highlights": "../tours/Butrinti_Saranda_Highlights.html"
    };

    findMyTourButton.addEventListener("click", async function (e) {
        e.preventDefault();

        const experience = document.querySelector('input[name="experience"]:checked')?.value;
        const duration = document.querySelector('input[name="duration"]:checked')?.value;
        const preference = document.querySelector('input[name="preference"]:checked')?.value;

        if (!experience || !duration || !preference) {
            alert("Please answer all questions before proceeding.");
            return;
        }

        aiLoading.style.display = "flex";

        try {
            const res = await fetch(`${API_BASE_URL}/recommend-tour`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ experience, duration, preference })
            });

            const data = await res.json();
            aiLoading.style.display = "none";

            // Match tour URL if possible
            let matchedTour = Object.keys(tourMap).find(tour =>
                data.recommendation.toLowerCase().includes(tour.toLowerCase())
            );
            let tourURL = matchedTour ? tourMap[matchedTour] : null;

            // Add header and image dynamically
            document.getElementById("tour-name-header").textContent = matchedTour || "Your Perfect Tour";
            const thumbnail = document.getElementById("tour-thumbnail");

            // Assign a corresponding image (update with real images as needed)
            const tourImages = {
                "Butrinti & Blue Eye": "../assets/images/Butrinti.jpg",
                "Saranda & Gjirokastra": "../assets/images/Saranda.jpg",
                "Museum Package": "../assets/images/Ksamil.avif",
                "Permeti": "../assets/images/Ksamil.avif",
                "Himara": "../assets/images/Porto_Palermo.jpg",
                "Gjirokastra + Blue Eye": "../assets/images/Blue_Eye.jpg",
                "Butrinti & Saranda Highlights": "../assets/images/Saranda.jpg"
            };

            if (matchedTour && tourImages[matchedTour]) {
                thumbnail.src = tourImages[matchedTour];
                thumbnail.style.display = "block";
            } else {
                thumbnail.style.display = "none";
            }

            aiText.innerHTML = `<strong>Recommended Tour:</strong><br>${data.recommendation}`;
            viewTourBtn.onclick = () => {
                if (tourURL) {
                    window.location.href = tourURL;
                } else {
                    alert("Couldn't identify a tour page from the recommendation.");
                }
            };
            retakeBtn.onclick = () => {
                document.getElementById("quizForm").reset();
                aiModal.style.display = "none";
                currentStep = 0;
                showStep(currentStep);
                window.scrollTo({ top: 0, behavior: "smooth" });
            };

            aiModal.style.display = "flex";

        } catch (err) {
            console.error("Fetch error:", err);
            aiLoading.style.display = "none";
            alert("Something went wrong. Please try again later.");
        }
    });

    // Reset state when returning
    sessionStorage.clear();
    quizForm.reset();
};
