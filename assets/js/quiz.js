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
    let tourPage = getTourPage(experience, duration, preference);

    // Redirect the user to the tour page
    if (tourPage) {
        window.location.href = tourPage;
    } else {
        alert("No suitable tour found. Please refine your preferences.");
    }
}

function getTourPage(experience, duration, preference) {
    const tours = {
        adventure: {
            "half-day": {
                nature: "../tours/Butrinti&Blue_Eye_tour.html",
                history: "../tours/Saranda&Gjirokastra_tour.html"
            },
            "full-day": {
                nature: "../tours/Permeti_tour.html",
                history: "../tours/Saranda&Gjirokastra_tour.html"
            },
            "multi-day": {
                nature: "../tours/Himara_tour.html",
                history: "../tours/Berati_tour.html"
            }
        },
        history: {
            "half-day": {
                nature: "../tours/Butrinti&Blue_Eye_tour.html",
                history: "../tours/Saranda&Gjirokastra_tour.html"
            },
            "full-day": {
                nature: "../tours/Saranda&Gjirokastra_tour.html",
                history: "../tours/Saranda&Gjirokastra_tour.html"
            },
            "multi-day": {
                nature: "../tours/Berati_tour.html",
                history: "../tours/Berati_tour.html"
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
                both: "../tours/All_day.html"
            },
            "multi-day": {
                nature: "../tours/Himara_tour.html",
                history: "../tours/Berati_tour.html",
                both: "../tours/All_day.html"
            }
        }
    };

    return tours[experience]?.[duration]?.[preference] || "";
}
