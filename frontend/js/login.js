// DOM Elements
const toggleBtns = document.querySelectorAll('.toggle-btn');
const authForms = document.querySelectorAll('.auth-form');
const passwordToggles = document.querySelectorAll('.password-toggle');
const passwordInputs = document.querySelectorAll('input[type="password"]');
const loginForm = document.getElementById('login-form')?.querySelector('form');
const signupForm = document.getElementById('signup-form')?.querySelector('form');
const forgotPasswordForm = document.getElementById('forgot-password-form')?.querySelector('form');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const forgotPasswordLink = document.querySelector('.forgot-password');
const signupPasswordInput = document.getElementById('signup-password');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');

// API endpoint
const API_URL = 'http://localhost/backend/api/auth.php';

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Toggle between login and signup forms
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const formToShow = btn.getAttribute('data-form');
            toggleActiveForm(formToShow);
        });
    });
    
    // Toggle password visibility
    passwordToggles.forEach((toggle, index) => {
        toggle.addEventListener('click', () => {
            togglePasswordVisibility(passwordInputs[index], toggle);
        });
    });
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Handle forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Navigate to forgot password form
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleActiveForm('forgot-password');
        });
    }
    
    // Navigate back to login form
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleActiveForm('login');
        });
    }
    
    // Password strength meter
    if (signupPasswordInput) {
        signupPasswordInput.addEventListener('input', checkPasswordStrength);
    }
});

// Function to toggle active authentication form
function toggleActiveForm(formId) {
    // Remove active class from all forms and toggle buttons
    authForms.forEach(form => form.classList.remove('active'));
    toggleBtns.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to the selected form
    document.getElementById(`${formId}-form`)?.classList.add('active');
    
    // Add active class to the corresponding toggle button (except for forgot-password)
    if (formId !== 'forgot-password') {
        document.querySelector(`.toggle-btn[data-form="${formId}"]`)?.classList.add('active');
    }
}

// Function to toggle password visibility
function togglePasswordVisibility(input, toggle) {
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Function to handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Send login request
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'login',
            email,
            password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store user data
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            }
            
            showNotification('Login successful!', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('An error occurred', 'error');
        console.error('Error:', error);
    });
}

// Function to handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const termsChecked = document.getElementById('terms').checked;
    
    // Validation
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!termsChecked) {
        showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    // Send registration request
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'register',
            name,
            email,
            password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Account created successfully!', 'success');
            toggleActiveForm('login');
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('An error occurred', 'error');
        console.error('Error:', error);
    });
}

// Function to handle forgot password form submission
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    // Send forgot password request
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'forgot_password',
            email
        })
    })
    .then(response => response.json())
    .then(data => {
        showNotification(data.message, data.success ? 'success' : 'error');
        if (data.success) {
            toggleActiveForm('login');
        }
    })
    .catch(error => {
        showNotification('An error occurred', 'error');
        console.error('Error:', error);
    });
}

// Function to check password strength
function checkPasswordStrength() {
    const password = signupPasswordInput.value;
    const strength = calculatePasswordStrength(password);
    
    // Update strength bar width and color
    strengthBar.style.width = `${(strength / 4) * 100}%`;
    
    // Update strength text and color
    switch (strength) {
        case 0:
            strengthBar.style.backgroundColor = '#ff4d4d';
            strengthText.textContent = 'Very weak';
            strengthText.style.color = '#ff4d4d';
            break;
        case 1:
            strengthBar.style.backgroundColor = '#ffa64d';
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#ffa64d';
            break;
        case 2:
            strengthBar.style.backgroundColor = '#ffff4d';
            strengthText.textContent = 'Medium';
            strengthText.style.color = '#cc9900';
            break;
        case 3:
            strengthBar.style.backgroundColor = '#4dff4d';
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#4dff4d';
            break;
        case 4:
            strengthBar.style.backgroundColor = '#4d4dff';
            strengthText.textContent = 'Very strong';
            strengthText.style.color = '#4d4dff';
            break;
    }
}

// Function to calculate password strength (0-4)
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // If password is empty, return 0
    if (password.length === 0) return strength;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 0.5;
    if (/[A-Z]/.test(password)) strength += 0.5;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    return Math.min(4, Math.floor(strength));
}

// Function to show notification
function showNotification(message, type) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    // If it doesn't exist, create it
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <p>${message}</p>
        <span class="notification-close">&times;</span>
    `;
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('fadeOut');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fadeOut');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Social login buttons (for demo purposes)
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const provider = this.classList.contains('google-btn') ? 'Google' : 'Facebook';
        showNotification(`${provider} authentication would happen here in a real app`, 'info');
    });
}); 