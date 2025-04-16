document.addEventListener('DOMContentLoaded', function() {
    // Initialize WOW.js for animations
    if (typeof WOW === 'function') {
        new WOW({
            offset: 100,
            mobile: false
        }).init();
    }

    // Load validation rules
    fetch('data/signin-rules.json')
        .then(response => response.json())
        .then(data => {
            initFormValidation(data.validationRules);
            initSocialLogin();
        })
        .catch(error => {
            console.error('Error loading form configuration:', error);
            initBasicValidation();
        });

    // Initialize form validation
    function initFormValidation(rules) {
        const form = document.getElementById('signinForm');
        if (!form) return;
        
        const authError = document.getElementById('authError');
        
        // Email validation
        const emailInput = form.querySelector('#email');
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                validateEmail(this, rules.email);
                hideAuthError();
            });
        }
        
        // Password validation
        const passwordInput = form.querySelector('#password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                validatePassword(this, rules.password);
                hideAuthError();
            });
        }
        
        // Toggle password visibility
        const togglePasswordBtn = form.querySelector('.btn-toggle-password');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', function() {
                const input = this.closest('.input-group').querySelector('input');
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            const isEmailValid = validateEmail(emailInput, rules.email);
            const isPasswordValid = validatePassword(passwordInput, rules.password);
            
            if (isEmailValid && isPasswordValid) {
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

    // Validate password field
    function validatePassword(input, rules) {
        const value = input.value;
        const feedback = input.nextElementSibling;
        
        if (!value) {
            showError(input, feedback, rules.errorMessages.required);
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

    // Show authentication error
    function showAuthError() {
        const authError = document.getElementById('authError');
        if (authError) {
            authError.classList.remove('d-none');
            // Scroll to error message
            authError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Hide authentication error
    function hideAuthError() {
        const authError = document.getElementById('authError');
        if (authError) {
            authError.classList.add('d-none');
        }
    }

    // Initialize social login buttons
    function initSocialLogin() {
        // Google login
        const googleBtn = document.querySelector('.btn-google');
        if (googleBtn) {
            googleBtn.addEventListener('click', function() {
                alert('Google login would be implemented here');
                // In a real app, this would trigger Google OAuth flow
            });
        }
        
        // Facebook login
        const facebookBtn = document.querySelector('.btn-facebook');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', function() {
                alert('Facebook login would be implemented here');
                // In a real app, this would trigger Facebook OAuth flow
            });
        }
        
        // Twitter login
        const twitterBtn = document.querySelector('.btn-twitter');
        if (twitterBtn) {
            twitterBtn.addEventListener('click', function() {
                alert('Twitter login would be implemented here');
                // In a real app, this would trigger Twitter OAuth flow
            });
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
        btnText.textContent = 'Signing In...';
        
        // Get form data
        const formData = {
            email: form.querySelector('#email').value.trim(),
            password: form.querySelector('#password').value,
            rememberMe: form.querySelector('#rememberMe').checked
        };
        
        // Simulate API call with random success/failure
        setTimeout(() => {
            // For demo purposes, randomly succeed or fail
            const isSuccess = Math.random() > 0.2;
            
            // Hide loading state
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            btnText.textContent = 'Sign In';
            
            if (isSuccess) {
                // Show success message and redirect
                alert('Login successful! Redirecting to dashboard...');
                // In a real app, you would redirect:
                // window.location.href = 'dashboard.html';
            } else {
                // Show error message
                showAuthError();
            }
        }, 1500);
    }

    // Basic validation fallback
    function initBasicValidation() {
        const form = document.getElementById('signinForm');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (isValid) {
                submitForm(form);
            }
        });
    }
});