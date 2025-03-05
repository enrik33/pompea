document.addEventListener("DOMContentLoaded", function () {
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

    // Initialize slide index
    let slideIndex = 1;

    // Set interval to change slides every 5 seconds
    let slideInterval = setInterval(() => {
        plusSlides(1);
    }, 5000);

    // Show the initial slide
    showSlides(slideIndex);

    // Add event listeners for previous and next buttons
    document.querySelectorAll('.prev').forEach(button => {
        button.addEventListener('click', () => plusSlides(-1));
    });

    document.querySelectorAll('.next').forEach(button => {
        button.addEventListener('click', () => plusSlides(1));
    });

    // Add event listeners for dot navigation
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', () => currentSlide(index + 1));
    });

    // Pause the slideshow on mouseover
    document.querySelector('.slideshow-container')?.addEventListener('mouseover', () => {
        clearInterval(slideInterval);
    });

    // Resume the slideshow on mouseout
    document.querySelector('.slideshow-container')?.addEventListener('mouseout', () => {
        slideInterval = setInterval(() => {
            plusSlides(1);
        }, 5000);
    });

    // Variables to store touch positions
    let touchStartX = 0;
    let touchEndX = 0;

    // Store the starting touch position
    document.querySelector('.slideshow-container')?.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
    });

    // Store the ending touch position and handle the gesture
    document.querySelector('.slideshow-container')?.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].screenX;
        handleGesture();
    });

    // Handle swipe gestures
    function handleGesture() {
        if (touchEndX < touchStartX) {
            plusSlides(1);
        }
        if (touchEndX > touchStartX) {
            plusSlides(-1);
        }
    }

    // Change slide by n
    function plusSlides(n) {
        slideIndex += n;
        showSlides(slideIndex);
    }

    // Show the current slide
    function currentSlide(n) {
        slideIndex = n;
        showSlides(slideIndex);
    }

    // Display the slide and update dots
    function showSlides(n) {
        const slides = document.querySelectorAll(".mySlides");
        const dots = document.querySelectorAll(".dot");

        if (slides.length === 0 || dots.length === 0) {
            console.error("Slides or dots not found in the document.");
            return;
        }

        if (n > slides.length) { slideIndex = 1; }
        if (n < 1) { slideIndex = slides.length; }

        slides.forEach(slide => slide.style.display = "none");
        dots.forEach(dot => dot.classList.remove("active"));

        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].classList.add("active");
    }
});

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
