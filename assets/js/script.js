document.addEventListener("DOMContentLoaded", function () {

    if (typeof jQuery == 'undefined') {
        console.error("jQuery is not loaded!");
    } else {
        console.log("jQuery is loaded successfully.");
    }

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

    function adjustSlideshow() {
        const slideTexts = document.querySelectorAll(".text-overlay");
        slideTexts.forEach(text => {
            if (window.innerWidth < 768) {
                text.style.fontSize = "4vw";
                text.style.width = "80%";
            } else {
                text.style.fontSize = "2vw";
                text.style.width = "60%";
            }
        });
    }

    window.addEventListener("resize", adjustSlideshow);
    adjustSlideshow();

    function adjustTourGrid() {
        const tourTexts = document.querySelectorAll(".text-block");
        tourTexts.forEach(text => {
            if (window.innerWidth < 768) {
                text.style.fontSize = "3vw";
            } else {
                text.style.fontSize = "1.7vw";
            }
        });
    }

    window.addEventListener("resize", adjustTourGrid);
    adjustTourGrid();
});