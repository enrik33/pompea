(function() {
    let slideIndex = 1;
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

    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    function showSlides(n) {
        const slides = document.querySelectorAll(".mySlides");
        const dots = document.querySelectorAll(".dot");

        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }

        slides.forEach(slide => slide.style.display = "none");
        dots.forEach(dot => dot.classList.remove("active"));

        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].classList.add("active");
    }
})();