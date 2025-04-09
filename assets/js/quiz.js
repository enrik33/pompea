window.onload = function () {
    const quizPopup = document.getElementById("quiz-popup");
    const quizSummary = document.getElementById("quiz-summary");
    const confirmButton = document.getElementById("confirm-quiz");
    const cancelButton = document.getElementById("cancel-quiz");
    const findMyTourButton = document.getElementById("findMyTourButton");
    let selectedTourPage = "";

    function calculateResult() {
        // Get user selections
        let experience = document.querySelector('input[name="experience"]:checked')?.value;
        let duration = document.querySelector('input[name="duration"]:checked')?.value;
        let preference = document.querySelector('input[name="preference"]:checked')?.value;

        // Ensure all answers are selected
        if (!experience || !duration || !preference) {
            alert("Please answer all questions before proceeding.");
            return;
        }

        // Determine the best tour match based on user selections
        selectedTourPage = getTourPage(experience, duration, preference);

        // Show the popup with user selection summary
        quizSummary.innerHTML = `You selected:<br>- <strong>Experience:</strong> ${experience}<br>- <strong>Duration:</strong> ${duration}<br>- <strong>Preference:</strong> ${preference}<br><br>Would you like to proceed to the recommended tour?`;
        quizPopup.style.display = "flex";
    }

    function getTourPage(experience, duration, preference) {
        const tours = {
            adventure: {
                "half-day": {
                    nature: "../tours/Butrinti&Blue_Eye_tour.html",
                    history: "../tours/Saranda&Gjirokastra_tour.html",
                    both: "../tours/Butrinti&Blue_Eye_tour.html"
                },
                "full-day": {
                    nature: "../tours/Permeti_tour.html",
                    history: "../tours/Saranda&Gjirokastra_tour.html",
                    both: "../tours/Museum.html"
                },
                "multi-day": {
                    nature: "../tours/Himara_tour.html",
                    history: "../tours/Berati_tour.html",
                    both: "../tours/Museum.html"
                }
            },
            culture: {
                "half-day": {
                    nature: "../tours/Butrinti&Blue_Eye_tour.html",
                    history: "../tours/Saranda&Gjirokastra_tour.html",
                    both: "../tours/Butrinti&Blue_Eye_tour.html"
                },
                "full-day": {
                    nature: "../tours/Saranda&Gjirokastra_tour.html",
                    history: "../tours/Saranda&Gjirokastra_tour.html",
                    both: "../tours/Museum.html"
                },
                "multi-day": {
                    nature: "../tours/Berati_tour.html",
                    history: "../tours/Berati_tour.html",
                    both: "../tours/Museum.html"
                }
            },
            relaxation: {
                "half-day": {
                    nature: "../tours/Butrinti&Blue_Eye_tour.html",
                    history: "../tours/Saranda&Gjirokastra_tour.html",
                    both: "../tours/Butrinti&Blue_Eye_tour.html"
                },
                "full-day": {
                    nature: "../tours/Himara_tour.html",
                    history: "../tours/Saranda&Gjirokastra_tour.html",
                    both: "../tours/Museum.html"
                },
                "multi-day": {
                    nature: "../tours/Himara_tour.html",
                    history: "../tours/Berati_tour.html",
                    both: "../tours/Museum.html"
                }
            }
        };
        return tours[experience]?.[duration]?.[preference] || "";
    }

    // Handle Confirm Button Click
    confirmButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent any form submission
        if (selectedTourPage) {
            window.location.href = selectedTourPage; // Navigate to the selected tour
        } else {
            alert("No suitable tour found. Please refine your preferences.");
        }
    });


    // Handle Cancel Button Click
    cancelButton.addEventListener("click", function () {
        quizPopup.style.display = "none";
    });

    // Attach event listener to the correct button AFTER page load
    if (findMyTourButton) {
        findMyTourButton.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default form submission
            calculateResult();
        });
    } else {
        console.error("findMyTourButton not found!");
    }

    // Reset the quiz when returning to the page
    sessionStorage.clear();
    quizForm.reset();
};
