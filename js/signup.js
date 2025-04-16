document.addEventListener('DOMContentLoaded', function() {
    // Initialize WOW.js for animations
    if (typeof WOW === 'function') {
        new WOW({
            offset: 100,
            mobile: false
        }).init();
    }

    // Load validation rules and terms content
    fetch('data/signup-rules.json')
        .then(response => response.json())
        .then(data => {
            const validationRules = data.validationRules;
            const termsContent = data.termsContent;
            
            // Load terms content into modal
            loadTermsContent(termsContent);
            
            // Initialize form validation
            initFormValidation(validationRules);
            
            // Initialize password strength meter
            initPasswordStrengthMeter(validationRules.password);
            
            // Initialize social login buttons
            initSocialLogin();
        })
        .catch(error => {
            console.error('Error loading form configuration:', error);
            // Fallback to basic validation if JSON fails to load
            initBasicValidation();
        });

    // Load terms content into modal
    function loadTermsContent(terms) {
        const termsContainer = document.getElementById('termsContent');
        if (!termsContainer) return;
        
        let html = `
            <h6 class="text-muted mb-3">Last Updated: ${terms.lastUpdated}</h6>
            <div class="terms-content">
        `;
        
        terms.sections.forEach(section => {
            html += `
                <div class="mb-4">
                    <h5 class="text-success">${section.title}</h5>
                    <p>${section.content}</p>
                </div>
            `;
        });
        
        html += `</div>`;
        termsContainer.innerHTML = html;
    }

    // Initialize form validation
    function initFormValidation(rules) {
        const form = document.getElementById('signupForm');
        if (!form) return;
        
        // Name validation
        const nameInput = form.querySelector('#name');
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                validateName(this, rules.name);
            });
        }
        
        // Email validation
        const emailInput = form.querySelector('#email');
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                validateEmail(this, rules.email);
            });
        }
        
        // Password validation
        const passwordInput = form.querySelector('#password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                validatePassword(this, rules.password);
                checkPasswordMatch();
            });
        }
        
        // Confirm password validation
        const confirmPasswordInput = form.querySelector('#confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        }
        
        // Toggle password visibility
        const togglePasswordBtns = form.querySelectorAll('.btn-toggle-password');
        togglePasswordBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.closest('.input-group').querySelector('input');
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            const isNameValid = validateName(nameInput, rules.name);
            const isEmailValid = validateEmail(emailInput, rules.email);
            const isPasswordValid = validatePassword(passwordInput, rules.password);
            const isConfirmValid = checkPasswordMatch();
            const isTermsChecked = form.querySelector('#terms').checked;
            
            if (!isTermsChecked) {
                const termsFeedback = form.querySelector('#terms + .invalid-feedback');
                if (termsFeedback) {
                    termsFeedback.style.display = 'block';
                }
            }
            
            if (isNameValid && isEmailValid && isPasswordValid && isConfirmValid && isTermsChecked) {
                submitForm(form);
            }
        });
    }

    // Validate name field
    function validateName(input, rules) {
        const value = input.value.trim();
        const feedback = input.nextElementSibling;
        
        if (!value) {
            showError(input, feedback, rules.errorMessages.required);
            return false;
        }
        
        if (value.length < rules.minLength) {
            showError(input, feedback, rules.errorMessages.minLength);
            return false;
        }
        
        if (value.length > rules.maxLength) {
            showError(input, feedback, rules.errorMessages.maxLength);
            return false;
        }
        
        if (!new RegExp(rules.regex).test(value)) {
            showError(input, feedback, rules.errorMessages.invalidChars);
            return false;
        }
        
        showSuccess(input, feedback);
        return true;
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
        const feedback = document.getElementById('password-feedback');
        
        if (!value) {
            showError(input, feedback, rules.errorMessages.required);
            return false;
        }
        
        if (value.length < rules.minLength) {
            showError(input, feedback, rules.errorMessages.minLength);
            return false;
        }
        
        let errors = [];
        
        if (rules.requireUppercase && !/[A-Z]/.test(value)) {
            errors.push(rules.errorMessages.noUppercase);
        }
        
        if (rules.requireLowercase && !/[a-z]/.test(value)) {
            errors.push(rules.errorMessages.noLowercase);
        }
        
        if (rules.requireNumber && !/[0-9]/.test(value)) {
            errors.push(rules.errorMessages.noNumber);
        }
        
        if (rules.requireSpecialChar && !/[^A-Za-z0-9]/.test(value)) {
            errors.push(rules.errorMessages.noSpecialChar);
        }
        
        if (errors.length > 0) {
            showError(input, feedback, errors.join('<br>'));
            return false;
        }
        
        showSuccess(input, feedback);
        return true;
    }

    // Check password match
    function checkPasswordMatch() {
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');
        const feedback = confirmInput.nextElementSibling;
        
        if (!passwordInput || !confirmInput) return false;
        
        if (passwordInput.value !== confirmInput.value) {
            showError(confirmInput, feedback, 'Passwords do not match');
            return false;
        }
        
        if (confirmInput.value === '') {
            showError(confirmInput, feedback, 'Please confirm your password');
            return false;
        }
        
        showSuccess(confirmInput, feedback);
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

    // Initialize password strength meter
    function initPasswordStrengthMeter(rules) {
        const passwordInput = document.getElementById('password');
        if (!passwordInput) return;
        
        const strengthMeter = document.querySelector('.password-strength');
        const progressBar = strengthMeter.querySelector('.progress-bar');
        const strengthText = strengthMeter.querySelector('.strength-text span');
        
        passwordInput.addEventListener('input', function() {
            const value = this.value;
            
            if (!value) {
                strengthMeter.classList.remove('show');
                return;
            }
            
            strengthMeter.classList.add('show');
            
            let score = 0;
            
            // Length check
            if (value.length >= rules.minLength) score++;
            
            // Uppercase check
            if (rules.requireUppercase && /[A-Z]/.test(value)) score++;
            
            // Lowercase check
            if (rules.requireLowercase && /[a-z]/.test(value)) score++;
            
            // Number check
            if (rules.requireNumber && /[0-9]/.test(value)) score++;
            
            // Special char check
            if (rules.requireSpecialChar && /[^A-Za-z0-9]/.test(value)) score++;
            
            // Determine strength level
            let level = '';
            let color = '';
            let text = '';
            
            for (const [key, config] of Object.entries(rules.strengthLevels)) {
                if (score >= config.minScore && score <= config.maxScore) {
                    level = key;
                    color = config.color;
                    text = config.text;
                    break;
                }
            }
            
            // Update UI
            progressBar.style.width = `${(score / 4) * 100}%`;
            progressBar.style.backgroundColor = color;
            strengthText.textContent = text;
            strengthText.style.color = color;
        });
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
        btnText.textContent = 'Creating Account...';
        
        // Simulate API call
        setTimeout(() => {
            // Hide loading state
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            btnText.textContent = 'Create Account';
            
            // Show success message
            alert('Account created successfully! Redirecting to dashboard...');
            
            // In a real app, you would redirect or update UI
            // window.location.href = 'dashboard.html';
        }, 2000);
    }

    // Basic validation fallback
    function initBasicValidation() {
        const form = document.getElementById('signupForm');
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
            
            // Check password match
            const password = form.querySelector('#password');
            const confirmPassword = form.querySelector('#confirmPassword');
            
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                password.classList.add('is-invalid');
                confirmPassword.classList.add('is-invalid');
                confirmPassword.nextElementSibling.style.display = 'block';
                isValid = false;
            }
            
            // Check terms
            const terms = form.querySelector('#terms');
            if (terms && !terms.checked) {
                terms.classList.add('is-invalid');
                terms.nextElementSibling.querySelector('.invalid-feedback').style.display = 'block';
                isValid = false;
            }
            
            if (isValid) {
                submitForm(form);
            }
        });
    }
});