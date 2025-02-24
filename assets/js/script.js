(function() {
    // Initialize slide index
    let slideIndex = 1;
    let slideInterval = setInterval(() => {
        plusSlides(1);
    }, 5000);

    showSlides(slideIndex);

    document.querySelectorAll('.prev').forEach(button => {
        button.addEventListener('click', () => plusSlides(-1));
    });

    document.querySelectorAll('.next').forEach(button => {
        button.addEventListener('click', () => plusSlides(1));
    });

    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', () => currentSlide(index + 1));
    });

    document.querySelector('.slideshow-container').addEventListener('mouseover', () => {
        clearInterval(slideInterval);
    });

    document.querySelector('.slideshow-container').addEventListener('mouseout', () => {
        slideInterval = setInterval(() => {
            plusSlides(1);
        }, 5000);
    });

    let touchStartX = 0;
    let touchEndX = 0;

    document.querySelector('.slideshow-container').addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
    });

    document.querySelector('.slideshow-container').addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].screenX;
        handleGesture();
    });

    function handleGesture() {
        if (touchEndX < touchStartX) {
            plusSlides(1);
        }
        if (touchEndX > touchStartX) {
            plusSlides(-1);
        }
    }

    function plusSlides(n) {
        slideIndex += n;
        showSlides(slideIndex);
    }

    function currentSlide(n) {
        slideIndex = n;
        showSlides(slideIndex);
    }

    function showSlides(n) {
        const slides = document.querySelectorAll(".mySlides");
        const dots = document.querySelectorAll(".dot");

        if (n > slides.length) { slideIndex = 1; }
        if (n < 1) { slideIndex = slides.length; }

        slides.forEach(slide => slide.style.display = "none");
        dots.forEach(dot => dot.classList.remove("active"));

        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].classList.add("active");
    }
})();
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