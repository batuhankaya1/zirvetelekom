// Dynamic URL configuration
const BASE_URL = window.location.origin;

// Replace all hardcoded localhost URLs
document.addEventListener('DOMContentLoaded', function() {
    // Update all links
    const links = document.querySelectorAll('a[href*="localhost:3000"]');
    links.forEach(link => {
        link.href = link.href.replace('http://localhost:3000', BASE_URL);
    });
    
    // Update onclick handlers
    const buttons = document.querySelectorAll('[onclick*="localhost:3000"]');
    buttons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        button.setAttribute('onclick', onclick.replace(/http:\/\/localhost:3000/g, BASE_URL));
    });
});