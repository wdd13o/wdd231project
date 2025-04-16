document.addEventListener('DOMContentLoaded', function() {
    // Initialize WOW.js for animations
    if (typeof WOW === 'function') {
        new WOW({
            offset: 100,
            mobile: false
        }).init();
    }

    // Get the email from URL parameters or localStorage
    function getEmailFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('email');
    }

    function getEmailFromLocalStorage() {
        return localStorage.getItem('newUserEmail');
    }

    // Display the user's email
    function displayUserEmail() {
        const emailElement = document.getElementById('userEmail');
        if (!emailElement) return;

        // Try to get email from URL first, then localStorage
        const email = getEmailFromURL() || getEmailFromLocalStorage() || 'your email';
        emailElement.textContent = email;

        // Clear the localStorage after displaying
        if (getEmailFromLocalStorage()) {
            localStorage.removeItem('newUserEmail');
        }
    }

    // Add confetti effect for celebration
    function addConfettiEffect() {
        // Only load confetti library if not already loaded
        if (typeof confetti === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
            script.onload = function() {
                triggerConfetti();
            };
            document.head.appendChild(script);
        } else {
            triggerConfetti();
        }
    }

    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B']
        });
    }

    // Initialize page
    displayUserEmail();
    
    // Only trigger confetti on first visit to this page
    if (!sessionStorage.getItem('confettiShown')) {
        addConfettiEffect();
        sessionStorage.setItem('confettiShown', 'true');
    }

    // Add animation to check icon
    const checkIcon = document.querySelector('.icon-circle');
    if (checkIcon) {
        checkIcon.style.animation = 'bounceIn 1s ease';
    }
});