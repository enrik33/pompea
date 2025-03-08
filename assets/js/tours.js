// jQuery FAQ Toggle Implementation (Improved)
$(document).ready(function () {
    // Ensure all FAQ answers are hidden initially
    $(".faq-answer").hide();

    $(".faq-question").click(function () {
        // Close all FAQ answers except the one being clicked
        $(".faq-answer").not($(this).next()).slideUp();

        // Toggle the clicked FAQ answer
        $(this).next(".faq-answer").slideToggle();
    });
});

// JavaScript for Countdown Timer

function startCountdown(durationInMinutes) {
    let countdownElement = document.getElementById("countdown");
    let timeRemaining = durationInMinutes * 60;

    function updateCountdown() {
        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;
        countdownElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeRemaining > 0) {
            timeRemaining--;
            setTimeout(updateCountdown, 1000);
        } else {
            countdownElement.textContent = "Offer Expired";
        }
    }

    updateCountdown();
}

// Start countdown for a 60-minute offer window
startCountdown(60);


const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("links");

menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");
    navLinks.classList.toggle("hidden"); // Ensure it hides properly
});

const timelineItems = document.querySelectorAll(".timeline-item");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, { threshold: 0.3 });

timelineItems.forEach(item => {
    observer.observe(item);
});