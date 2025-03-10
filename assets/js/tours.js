document.addEventListener("DOMContentLoaded", function () {
    // Menu Toggle Logic (Fix)
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("active");
            navLinks.classList.toggle("hidden"); // Ensure it hides properly
        });
    } else {
        console.error("Menu toggle or nav links not found on this page.");
    }

    // FAQ Toggle Implementation
    $(document).ready(function () {
        $(".faq-answer").hide();
        $(".faq-question").click(function () {
            $(".faq-answer").not($(this).next()).slideUp();
            $(this).next(".faq-answer").slideToggle();
        });
    });

    // Countdown Timer
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
        if (countdownElement) {
            updateCountdown();
        }
    }

    startCountdown(60);

    // Timeline Animation
    const timelineItems = document.querySelectorAll(".timeline-item");

    if (timelineItems.length > 0) {
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
    }
});
