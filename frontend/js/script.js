// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const homeSearch = document.getElementById('home-search');
const searchBtn = document.querySelector('.search-btn');

// Toggle Mobile Navigation Menu
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
});

// Dark Mode Toggle
if (themeToggle) {
    // Check if user previously enabled dark mode
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        // Toggle dark mode
        body.classList.toggle('dark-mode');
        
        // Update icon
        if (body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

// Search Functionality
if (homeSearch && searchBtn) {
    // Handle search on button click
    searchBtn.addEventListener('click', () => {
        handleSearch();
    });

    // Handle search on Enter key press
    homeSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// Search Handler
function handleSearch() {
    const searchTerm = homeSearch.value.trim();
    if (searchTerm !== '') {
        // Store the search term in session storage
        sessionStorage.setItem('searchTerm', searchTerm);
        // Redirect to symptom checker page
        window.location.href = 'symptom-checker.html';
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Animation on scroll (simple implementation)
window.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('.feature-card, .tip-card');
    
    elements.forEach(el => {
        const elementPosition = el.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
});

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    // Set initial opacity for animation elements
    const animatedElements = document.querySelectorAll('.feature-card, .tip-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Check if we are on the symptom checker page
    const symptomForm = document.getElementById('symptom-form');
    if (symptomForm) {
        // Get search term from session storage if available
        const searchTerm = sessionStorage.getItem('searchTerm');
        if (searchTerm) {
            document.getElementById('symptoms-input').value = searchTerm;
            sessionStorage.removeItem('searchTerm'); // Clear after use
        }
        
        // Handle form submission
        symptomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            analyzeSymptoms();
        });
    }
    
    // Check if we are on the medicine details page
    const medicineSearch = document.getElementById('medicine-search');
    if (medicineSearch) {
        medicineSearch.addEventListener('input', searchMedicines);
    }
}); 