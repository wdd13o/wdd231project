document.addEventListener('DOMContentLoaded', function() {
    // Initialize WOW.js for animations
    if (typeof WOW === 'function') {
        new WOW({
            offset: 100,
            mobile: false
        }).init();
    }

    // Load validation rules
    fetch('data/forgot-password-rules.json')
        .then(response => response.json())
        .then(data => {
            initFormValidation(data.validationRules);
        })
        .catch(error => {
            console.error('Error loading form configuration:', error);
            initBasicValidation();
        });

    // Initialize form validation
    function initFormValidation(rules) {
        const form = document.getElementById('forgotPasswordForm');
        if (!form) return;
        
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        // Email validation
        const emailInput = form.querySelector('#email');
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                validateEmail(this, rules.email);
                hideMessages();
            });
        }
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate email
            const isEmailValid = validateEmail(emailInput, rules.email);
            
            if (isEmailValid) {
                submitForm(form);
            }
        });
    }

    // Validate email field
    function validateEmail(input, rules) {
        const value = input.value.trim();
        const feedback = input.nextElementSibling;
        
        if (!value) {
            showError(input, feedback, rules.errorMessages.required);
            return false;
        }
        
        if (!new RegExp(rules.regex).test(value)) {
            showError(input, feedback, rules.errorMessages.invalid);
            return false;
        }
        
        showSuccess(input, feedback);
        return true;
    }

    // Show error state
    function showError(input, feedback, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        if (feedback) {
            feedback.innerHTML = message;
            feedback.style.display = 'block';
        }
    }

    // Show success state
    function showSuccess(input, feedback) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    // Hide all messages
    function hideMessages() {
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        if (successMessage) successMessage.classList.add('d-none');
        if (errorMessage) errorMessage.classList.add('d-none');
    }

    // Show success message
    function showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        const form = document.getElementById('forgotPasswordForm');
        
        if (successMessage && form) {
            successMessage.classList.remove('d-none');
            form.reset();
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Show error message
    function showErrorMessage(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.classList.remove('d-none');
            // Scroll to error message
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Submit form data
    function submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const spinner = submitBtn.querySelector('.spinner-border');
        const btnText = submitBtn.querySelector('.btn-text');
        
        // Show loading state
        submitBtn.disabled = true;
        spinner.classList.remove('d-none');
        btnText.textContent = 'Sending...';
        
        // Get form data
        const formData = {
            email: form.querySelector('#email').value.trim()
        };
        
        // Simulate API call with random success/failure
        setTimeout(() => {
            // For demo purposes, randomly succeed or fail
            const isSuccess = Math.random() > 0.2;
            
            // Hide loading state
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            btnText.textContent = 'Send Reset Link';
            
            if (isSuccess) {
                // Show success message
                showSuccessMessage();
            } else {
                // Show error message
                showErrorMessage('This email address is not registered. Please try again.');
            }
        }, 1500);
    }

    // Basic validation fallback
    function initBasicValidation() {
        const form = document.getElementById('forgotPasswordForm');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = form.querySelector('#email');
            let isValid = true;
            
            if (!emailInput.value.trim()) {
                emailInput.classList.add('is-invalid');
                isValid = false;
            } else {
                emailInput.classList.remove('is-invalid');
            }
            
            if (isValid) {
                submitForm(form);
            }
        });
    }
});